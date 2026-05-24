import Link from "next/link";
import Image from "next/image";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

const sizes = {
  sm: { emblem: 32, text: "text-xl",  spacing: "gap-2"   },
  md: { emblem: 42, text: "text-2xl", spacing: "gap-2.5" },
  lg: { emblem: 60, text: "text-4xl", spacing: "gap-3.5" },
  xl: { emblem: 88, text: "text-6xl", spacing: "gap-5"   },
};

export default function Logo({ size = "md", href }: Props) {
  const s = sizes[size];

  const inner = (
    <span className={`inline-flex items-center ${s.spacing} select-none`}>
      <Image
        src="/images/logo-emblem-v2.png"
        alt="Masteryn amblem"
        width={s.emblem}
        height={s.emblem}
        style={{ width: s.emblem, height: "auto", objectFit: "contain" }}
        priority
      />
      <span
        className={`${s.text} font-bold tracking-wide`}
        style={{
          background: "linear-gradient(135deg, #E8D09A 0%, #C9A96E 45%, #A8894E 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 8px rgba(201,169,110,0.4))",
        }}
      >
        Masteryn
      </span>
    </span>
  );

  if (!href) return inner;
  return <Link href={href} className="inline-block hover:opacity-90 transition-opacity">{inner}</Link>;
}
