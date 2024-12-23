"use client";

export function ErrorBoundary() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    </div>
  );
} 