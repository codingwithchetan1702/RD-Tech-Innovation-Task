import Link from "next/link";

export default function TopNav() {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <div className="text-sm font-semibold text-zinc-900">Invoice+RBAC</div>
        <nav className="flex items-center gap-4 text-sm text-zinc-700">
          <Link className="hover:text-zinc-900" href="/dashboard">
            Dashboard
          </Link>
          <Link className="hover:text-zinc-900" href="/invoices">
            Invoices
          </Link>
          <Link className="hover:text-zinc-900" href="/invoices/new">
            New Invoice
          </Link>
          <Link className="hover:text-zinc-900" href="/upload">
            Upload CSV
          </Link>
          <Link className="hover:text-zinc-900" href="/search">
            Search Data
          </Link>
        </nav>
      </div>
    </div>
  );
}

