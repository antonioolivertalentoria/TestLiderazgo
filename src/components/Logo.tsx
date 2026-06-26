import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
};

export function Logo({ size = 260, className }: LogoProps) {
  return (
    <Image
      src="/logo-talentoria.png"
      alt="Talentoría"
      width={size}
      height={Math.round(size * 0.42)}
      className={className}
      priority
    />
  );
}
