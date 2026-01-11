import HealthCheck from "./HealthCheck";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-slate-50 dark:bg-slate-950">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl w-full">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Hearth <span className="text-blue-600 dark:text-blue-400">Dashboard</span>
        </h1>

        <HealthCheck apiUrl={apiUrl} />

        <p className="text-slate-500 dark:text-slate-400 text-sm italic">
          Welcome to your hearth. Everything is looking good.
        </p>
      </main>
    </div>
  );
}
