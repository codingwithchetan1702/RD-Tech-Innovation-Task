export default function ErrorState({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <div className="text-sm font-medium">Something went wrong</div>
      <div className="mt-1 text-sm opacity-90">{error}</div>
    </div>
  );
}

