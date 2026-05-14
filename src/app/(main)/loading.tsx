export default function MainLoading() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-mocha-100 h-40 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}
