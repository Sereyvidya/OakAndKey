export default function PropertyLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto w-full max-w-5xl px-5 py-6">
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
