import Image from "next/image";

interface Props { size?: number; className?: string; }

export default function MasterynEmblem({ size = 200, className = "" }: Props) {
  return (
    <Image
      src="/images/logo-emblem-v2.png"
      alt="Masteryn Amblemi"
      width={size}
      height={size}
      style={{ width: size, height: "auto", objectFit: "contain" }}
      className={className}
      priority
    />
  );
}
