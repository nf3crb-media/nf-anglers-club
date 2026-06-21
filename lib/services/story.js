import { addAktivitasPoin } from "@/lib/poin";
import {
  evaluateCatchForMission,
  missionProgressLabel,
  resolveMissionStatus,
} from "@/lib/story-core";
import { applyXpGain, ensureGameProgress } from "@/lib/services/game-progress";

export async function getStoryForMember(supabase, memberId) {
  const gameRow = await ensureGameProgress(supabase, memberId);
  const chapterNumber = gameRow.story_chapter ?? 1;

  const { data: chapter } = await supabase
    .from("story_chapter")
    .select("*")
    .eq("chapter_number", chapterNumber)
    .eq("aktif", true)
    .maybeSingle();

  if (!chapter) {
    return {
      game: gameRow,
      chapter: null,
      missions: [],
      chapter_complete: false,
    };
  }

  const levelLocked = (gameRow.angler_level ?? 1) < (chapter.unlock_level ?? 1);

  const { data: missionsRaw } = await supabase
    .from("story_mission")
    .select("*")
    .eq("chapter_id", chapter.id)
    .eq("aktif", true)
    .order("mission_number");

  const missions = missionsRaw || [];
  const missionIds = missions.map((m) => m.id);

  let progressRows = [];
  if (missionIds.length) {
    const { data } = await supabase
      .from("member_mission_progress")
      .select("*")
      .eq("member_id", memberId)
      .in("mission_id", missionIds);
    progressRows = data || [];
  }

  const progressMap = new Map(progressRows.map((r) => [r.mission_id, r]));

  let previousCompleted = true;
  const enriched = missions.map((mission) => {
    const progress = progressMap.get(mission.id);
    const status = levelLocked
      ? "locked"
      : resolveMissionStatus(mission, progress, previousCompleted);
    const progress_data = progress?.progress_data || {};

    if (status === "completed") {
      previousCompleted = true;
    } else {
      previousCompleted = false;
    }

    return {
      ...mission,
      status,
      progress_data,
      progress_label: missionProgressLabel(mission, progress_data),
      completed_at: progress?.completed_at ?? null,
    };
  });

  const chapter_complete =
    enriched.length > 0 && enriched.every((m) => m.status === "completed");

  return {
    game: gameRow,
    chapter: { ...chapter, level_locked: levelLocked },
    missions: enriched,
    chapter_complete,
  };
}

async function completeMission(supabase, memberId, mission, progressRow) {
  const now = new Date().toISOString();

  await supabase
    .from("member_mission_progress")
    .update({
      status: "completed",
      completed_at: now,
    })
    .eq("id", progressRow.id);

  const xpReward = mission.xp_reward ?? 0;
  if (xpReward > 0) {
    await supabase.from("xp_log").insert({
      member_id: memberId,
      source: "story_mission",
      label: `Misi: ${mission.judul}`,
      xp: xpReward,
      ref_type: "story_mission",
      ref_id: mission.id,
      idempotency_key: `story-xp-${mission.id}-${memberId}`,
    }).then(({ error }) => {
      if (error && !error.message?.includes("duplicate")) {
        console.warn("[story/xp]", error.message);
      }
    });
    await applyXpGain(supabase, memberId, xpReward);
  }

  const apReward = mission.activity_point_reward ?? 0;
  if (apReward > 0) {
    await addAktivitasPoin(supabase, {
      member_id: memberId,
      poin: apReward,
      label: `Misi story · ${mission.judul}`,
    });
  }
}

async function maybeAdvanceChapter(supabase, memberId, chapterId) {
  const { data: missions } = await supabase
    .from("story_mission")
    .select("id")
    .eq("chapter_id", chapterId)
    .eq("aktif", true);

  if (!missions?.length) return;

  const { data: done } = await supabase
    .from("member_mission_progress")
    .select("mission_id")
    .eq("member_id", memberId)
    .eq("status", "completed")
    .in(
      "mission_id",
      missions.map((m) => m.id)
    );

  if ((done?.length ?? 0) < missions.length) return;

  const gameRow = await ensureGameProgress(supabase, memberId);
  const nextChapter = (gameRow.story_chapter ?? 1) + 1;

  const { data: nextExists } = await supabase
    .from("story_chapter")
    .select("chapter_number")
    .eq("chapter_number", nextChapter)
    .eq("aktif", true)
    .maybeSingle();

  if (!nextExists) return;

  await supabase
    .from("member_game_progress")
    .update({
      story_chapter: nextChapter,
      updated_at: new Date().toISOString(),
    })
    .eq("member_id", memberId);
}

export async function processCatchForStory(supabase, memberId, catchCtx) {
  const completed = [];
  let keepChecking = true;

  while (keepChecking) {
    keepChecking = false;
    const story = await getStoryForMember(supabase, memberId);
    if (!story.chapter || story.chapter.level_locked) break;

    for (const mission of story.missions) {
      if (mission.status === "locked" || mission.status === "completed") continue;

      const evalCtx = {
        ...catchCtx,
        progress_count: mission.progress_data?.count ?? 0,
      };
      const result = evaluateCatchForMission(mission, evalCtx);
      if (!result.matches) continue;

      const now = new Date().toISOString();

      const { data: existing } = await supabase
        .from("member_mission_progress")
        .select("*")
        .eq("member_id", memberId)
        .eq("mission_id", mission.id)
        .maybeSingle();

      const progress_data = { count: result.newCount, needed: result.needed };
      let progressId = existing?.id;

      if (!existing) {
        const { data: created, error } = await supabase
          .from("member_mission_progress")
          .insert({
            member_id: memberId,
            mission_id: mission.id,
            status: result.complete ? "completed" : "in_progress",
            progress_data,
            attempts: 1,
            started_at: now,
            completed_at: result.complete ? now : null,
          })
          .select()
          .single();
        if (error) {
          console.warn("[story/progress]", error.message);
          continue;
        }
        progressId = created.id;
      } else {
        const { error } = await supabase
          .from("member_mission_progress")
          .update({
            status: result.complete ? "completed" : "in_progress",
            progress_data,
            attempts: (existing.attempts ?? 0) + 1,
            started_at: existing.started_at || now,
            completed_at: result.complete ? now : existing.completed_at,
          })
          .eq("id", existing.id);
        if (error) {
          console.warn("[story/progress]", error.message);
          continue;
        }
      }

      if (result.complete && progressId) {
        await completeMission(supabase, memberId, mission, { id: progressId });
        await maybeAdvanceChapter(supabase, memberId, story.chapter.id);
        completed.push({
          mission_id: mission.id,
          judul: mission.judul,
          xp_reward: mission.xp_reward,
          activity_point_reward: mission.activity_point_reward,
        });
        keepChecking = true;
      }
    }
  }

  return completed;
}
