import { type Locale, t } from "@/lib/i18n";

function Stars() {
  return (
    <div className="flex gap-0.5 text-brand-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].testimonials;
  return (
    <section className="relative z-20 mx-auto max-w-4xl px-4 py-24">
      <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
        {s.title}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {s.reviews.map((review, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <Stars />
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              &ldquo;{review.text}&rdquo;
            </p>
            <p className="mt-4 text-sm font-medium text-white">
              {review.name}{" "}
              <span className="font-normal text-white/40">&middot; {review.date}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
