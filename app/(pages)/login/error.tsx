"use client";

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Login failed</h2>
      <pre>{error.message}</pre>
      <button onClick={() => reset()} type="button">
        Retry
      </button>
    </div>
  );
}
