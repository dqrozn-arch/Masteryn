"use client";

interface Props {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

export default function StarPicker({ value, onChange, label }: Props) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-300 text-sm">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`text-2xl transition-transform hover:scale-110 ${
              s <= value ? "text-yellow-400" : "text-zinc-700"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
