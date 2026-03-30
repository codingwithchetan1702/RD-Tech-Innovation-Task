import LoadingState from "@/components/LoadingState";
import { Suspense } from "react";

import InvoicesClient from "./InvoicesClient";

export default function InvoicesPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading invoices..." />}>
      <InvoicesClient />
    </Suspense>
  );
}

