"use client";

import { useEffect } from "react";

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => { }, [error]);

  return (
    <div>
      <h2>Dashboard failed</h2>
      <pre>{error.message}</pre>
      <button onClick={() => reset()} type="button">
        Retry
      </button>
    </div>
  );
}
