export default function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-zinc-600">
      <div className="text-sm">
        {label ? label : "Loading..."}
      </div>
    </div>
  );
}

