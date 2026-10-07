"use client";
import { useRouter } from "next/navigation";

export default function MonthPicker({ months, current }) {
  const router = useRouter();
  if (months.length < 2) return null;
  return (
    <label className="picker">
      <span>Report month</span>
      <select value={current} onChange={(e) => router.push(`/?m=${e.target.value}`)}>
        {months.map((m) => (
          <option key={m.month} value={m.month}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  );
}
