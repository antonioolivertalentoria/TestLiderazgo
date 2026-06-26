import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: number;
  className?: string;
  href?: string;
};

export function Logo({ size = 260, className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Ir al inicio"
      className="inline-block transition hover:opacity-80"
    >
      <Image
        src="/logo-talentoria.png"
        alt="Talentoría"
        width={size}
        height={Math.round(size * 0.42)}
        className={className}
        priority
      />
    </Link>
  );
}
