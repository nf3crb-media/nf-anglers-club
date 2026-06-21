import { NF_LOGO_SM, NF_LOGO_MD, NF_LOGO_LG } from "@/lib/nf-logos";

export default function NFLogo({ size = 30, className = "" }) {
  const src = size <= 50 ? NF_LOGO_SM : size <= 120 ? NF_LOGO_MD : NF_LOGO_LG;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="NF"
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.27,
        flexShrink: 0,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}
