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
    <div className="flex items-center gap-3 bg-bg-secondary rounded-full p-1 w-full md:w-auto">
      <button
        onClick={() => onChange(false)}
        className={`flex-1 md:flex-none px-4 py-2.5 md:py-1.5 min-h-11 md:min-h-0 rounded-full text-sm font-medium transition-all ${
          !value
            ? "bg-accent-primary text-white shadow-lg"
            : "text-text-secondary hover:text-text-primary"
        }`}
      >
        {labelLeft}
      </button>
      <button
        onClick={() => onChange(true)}
        className={`flex-1 md:flex-none px-4 py-2.5 md:py-1.5 min-h-11 md:min-h-0 rounded-full text-sm font-medium transition-all ${
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
