import dynamic from "next/dynamic";

const SpotMap = dynamic(() => import("@/components/map/SpotMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 200,
        display: "grid",
        placeItems: "center",
        color: "#7fa6ad",
        fontSize: 14,
      }}
    >
      Memuat peta... 🗺️
    </div>
  ),
});

export default function PetaPage() {
  return <SpotMap />;
}
