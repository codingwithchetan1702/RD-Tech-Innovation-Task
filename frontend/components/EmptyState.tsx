export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6">
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      {description ? <div className="mt-1 text-sm text-zinc-600">{description}</div> : null}
    </div>
  );
}

