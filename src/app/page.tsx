// src/app/page.tsx
import Bear from "./components/Bear";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      <h1 className="text-4xl font-bold mb-6">🐻 Meet the Berachain Talking Bear!</h1>
      <Bear />
    </main>
  );
}
