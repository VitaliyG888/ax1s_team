export function SectionIndex({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
      <span className="text-accent-2">/{index}</span>
      <span>{label}</span>
    </div>
  );
}
