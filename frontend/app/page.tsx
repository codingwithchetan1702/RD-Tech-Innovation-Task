export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Invoice Management System</h1>
      <p className="text-sm text-zinc-600">
        Use the navigation to explore the required modules: Dashboard, Invoices, Upload CSV, and Search.
      </p>
      <div className="flex gap-3">
        <a className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white" href="/dashboard">
          Go to Dashboard
        </a>
        <a className="rounded-md border px-4 py-2 text-sm text-zinc-900" href="/auth">
          Sign in
        </a>
      </div>
    </div>
  );
}
