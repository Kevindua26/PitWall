export default function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-f1-red/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-f1-red rounded-full animate-spin" />
      </div>
      <p className="text-f1-silver text-sm animate-pulse">{message}</p>
    </div>
  );
}

export function ErrorMessage({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="text-4xl">⚠️</div>
      <p className="text-f1-red font-semibold">Failed to load data</p>
      <p className="text-f1-silver text-sm text-center max-w-sm">{message}</p>
    </div>
  );
}
