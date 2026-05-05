export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-paper flex min-h-screen flex-col">
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
