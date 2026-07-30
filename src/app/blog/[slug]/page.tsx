import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: `${post.title} | Lejhøjtaler.dk`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://lejhojtaler.dk/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://lejhojtaler.dk/blog/${post.slug}`,
      siteName: "Lejhøjtaler.dk",
      locale: "da_DK",
      type: "article",
      publishedTime: post.date,
      ...(post.image ? { images: [{ url: post.image }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://lejhojtaler.dk/blog/${post.slug}`,
      },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Scharling Studio",
    },
    publisher: {
      "@type": "Organization",
      name: "Lejhøjtaler.dk",
      url: "https://lejhojtaler.dk",
    },
    mainEntityOfPage: `https://lejhojtaler.dk/blog/${post.slug}`,
    ...(post.image ? { image: post.image } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <main className="min-h-screen bg-[#07060b] px-4 py-20">
        <article className="mx-auto max-w-2xl">
          <nav className="mb-8 flex items-center gap-2 text-sm text-white/40">
            <Link href="/" className="hover:text-brand-400 transition">
              Forside
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-brand-400 transition">
              Blog
            </Link>
            <span>/</span>
            <span className="text-white/60 truncate">{post.title}</span>
          </nav>

          <time className="text-sm text-white/30">
            {new Date(post.date).toLocaleDateString("da-DK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl leading-tight">
            {post.title}
          </h1>

          <div
            className="prose-blog mt-10"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* CTA */}
          <section className="mt-16 glass rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-white">
              Klar til at leje? Book din hojtaler nu
            </h2>
            <p className="mt-2 text-white/50 text-sm">
              Fra 395 kr/weekend. Hent fredag, aflever mandag.
            </p>
            <Link
              href="/#book"
              className="mt-4 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-black hover:bg-brand-400 transition"
            >
              Book nu
            </Link>
          </section>

          <Link
            href="/blog"
            className="mt-10 inline-block text-sm text-white/40 hover:text-brand-400 transition"
          >
            &larr; Tilbage til blog
          </Link>
        </article>
      </main>
    </>
  );
}
