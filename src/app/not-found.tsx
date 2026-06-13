import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#07060b] px-4 text-center">
      <h1 className="text-5xl font-bold text-white">404</h1>
      <p className="mt-4 text-white/50">Siden blev ikke fundet.</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-black hover:bg-brand-400 transition"
      >
        Til forsiden
      </Link>
    </main>
  );
}
