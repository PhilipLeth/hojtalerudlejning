import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Lejhøjtaler.dk",
  description:
    "Guides og tips til højtalerudlejning, PA-anlæg, festlyd og festlys i København. Læs vores blog og bliv klogere på lyd til din næste fest.",
  alternates: { canonical: "https://lejhojtaler.dk/blog" },
  openGraph: {
    title: "Blog | Lejhøjtaler.dk",
    description:
      "Guides og tips til højtalerudlejning, PA-anlæg, festlyd og festlys i København.",
    url: "https://lejhojtaler.dk/blog",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Forside",
        item: "https://lejhojtaler.dk",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://lejhojtaler.dk/blog",
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
            href="/#book"
            className="inline-block text-sm text-white/40 hover:text-brand-400 transition mb-8"
          >
            &larr; Tilbage til forsiden
          </Link>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">Blog</h1>
          <p className="mt-2 text-white/50">
            Guides, tips og inspiration til din næste fest.
          </p>

          <div className="mt-10 space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block glass rounded-2xl p-6 hover:border-brand-500/40 transition group"
              >
                <time className="text-xs text-white/30">
                  {new Date(post.date).toLocaleDateString("da-DK", {
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
