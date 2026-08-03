import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Lejhøjtaler.dk",
  description:
    "Guides and tips for speaker rental, PA systems, party sound and party lights in Copenhagen. Read our blog and learn more about sound for your next party.",
  alternates: { canonical: "https://lejhojtaler.dk/en/blog" },
  openGraph: {
    title: "Blog | Lejhøjtaler.dk",
    description:
      "Guides and tips for speaker rental, PA systems, party sound and party lights in Copenhagen.",
    url: "https://lejhojtaler.dk/en/blog",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function BlogPageEn() {
  const posts = getAllPosts();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://lejhojtaler.dk/en",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://lejhojtaler.dk/en/blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="min-h-screen bg-[#07060b] px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/en#book"
            className="inline-block text-sm text-white/40 hover:text-brand-400 transition mb-8"
          >
            &larr; Back to home
          </Link>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">Blog</h1>
          <p className="mt-2 text-white/50">
            Guides, tips and inspiration for your next party.
          </p>

          <div className="mt-10 space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block glass rounded-2xl p-6 hover:border-brand-500/40 transition group"
              >
                <time className="text-xs text-white/30">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="mt-1 text-lg font-semibold text-white group-hover:text-brand-400 transition">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-white/50">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
