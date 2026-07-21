interface RefreshIntervalSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const intervals = [
  { label: "Manual", value: 0 },
  { label: "1 sec", value: 1000 },
  { label: "3 sec", value: 3000 },
  { label: "5 sec", value: 5000 },
  { label: "10 sec", value: 10000 },
];

export default function RefreshIntervalSelect({
  value,
  onChange,
}: RefreshIntervalSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-9 rounded-md border bg-background px-3 text-sm"
    >
      {intervals.map((interval) => (
        <option
          key={interval.value}
          value={interval.value}
        >
          {interval.label}
        </option>
      ))}
    </select>
  );
}