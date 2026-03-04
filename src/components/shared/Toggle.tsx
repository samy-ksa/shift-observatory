"use client";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  labelLeft: string;
  labelRight: string;
}

export default function Toggle({
  value,
  onChange,
  labelLeft,
  labelRight,
}: ToggleProps) {
  return (
    <div className="flex items-center gap-3 bg-bg-secondary rounded-full p-1">
      <button
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          !value
            ? "bg-accent-primary text-white shadow-lg"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        {labelLeft}
      </button>
      <button
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          value
            ? "bg-accent-saudi text-white shadow-lg"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        {labelRight}
      </button>
    </div>
  );
}
