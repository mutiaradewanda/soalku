import React from "react";

export type DragonMascotVariant =
  | "logo"
  | "pencil"
  | "waving"
  | "sitting"
  | "walking"
  | "cheering"
  | "sleeping"
  | "curled"
  | "playing";

interface DragonMascotProps {
  variant?: DragonMascotVariant;
  className?: string;
  size?: number | string;
  alt?: string;
}

// Version query ?v=5 to bypass browser cache
const mascotPaths: Record<DragonMascotVariant, string> = {
  logo: "/mascot/dragon-logo.png?v=5",
  pencil: "/mascot/dragon-pencil.png?v=5",
  waving: "/mascot/dragon-waving.png?v=5",
  sitting: "/mascot/dragon-sitting.png?v=5",
  walking: "/mascot/dragon-walking.png?v=5",
  cheering: "/mascot/dragon-cheering.png?v=5",
  sleeping: "/mascot/dragon-sleeping.png?v=5",
  curled: "/mascot/dragon-curled.png?v=5",
  playing: "/mascot/dragon-playing.png?v=5",
};

export const DragonMascot: React.FC<DragonMascotProps> = ({
  variant = "waving",
  className = "",
  size,
  alt = "Maskot Naga SoalKu",
}) => {
  const src = mascotPaths[variant] || mascotPaths.waving;

  const style = size
    ? {
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }
    : undefined;

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={`object-contain select-none pointer-events-none transition-transform ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};

export default DragonMascot;
