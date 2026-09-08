import { Metadata } from "next";
import Link from "next/link";
import { daBlogPath, getAllPosts, getPostBySlug } from "@/lib/blog";
import { AUTHOR, authorLd } from "@/lib/author";
import { startPrisDkk } from "@/lib/products";

/**
 * /en/blog/[slug] — de engelske blogindlæg.
 *
 * Indholdet kommer fra docs/en/. Et indlæg findes kun på de sprog, det er
 * skrevet på, så listen her er kortere end den danske indtil resten er
 * oversat — det er med vilje: et engelsk indeks, der linker til dansk
 * brødtekst, var netop den fejl siden havde.
 */
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts("en").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "en");
  return {
    title: `${post.title} | Lejhøjtaler.dk`,
    description: post.description,
    keywords: post.keywords,
    // Kun når der FINDES et dansk modstykke — slug'ene er forskellige, fordi
    // hver URL bærer sit sprogs søgeord, så hreflang kan ikke udledes af stien.
    alternates: {
      canonical: `https://lejhojtaler.dk/en/blog/${post.slug}`,
      ...(daBlogPath(post.slug)
        ? {
            languages: {
              da: `https://lejhojtaler.dk${daBlogPath(post.slug)}`,
              en: `https://lejhojtaler.dk/en/blog/${post.slug}`,
              "x-default": `https://lejhojtaler.dk${daBlogPath(post.slug)}`,
            },
          }
        : {}),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://lejhojtaler.dk/en/blog/${post.slug}`,
      siteName: "Lejhøjtaler.dk",
      locale: "en_GB",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [AUTHOR.url],
      ...(post.image ? { images: [{ url: post.image }] } : {}),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "en");

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lejhojtaler.dk/en" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://lejhojtaler.dk/en/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://lejhojtaler.dk/en/blog/${post.slug}`,
      },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated,
    inLanguage: "en",
    author: authorLd(),
    publisher: {
      "@type": "Organization",
      name: "Lejhøjtaler.dk",
      url: "https://lejhojtaler.dk",
      logo: { "@type": "ImageObject", url: "https://lejhojtaler.dk/icon-512.png" },
    },
    mainEntityOfPage: `https://lejhojtaler.dk/en/blog/${post.slug}`,
    ...(post.image ? { image: post.image } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <main className="min-h-screen bg-[#07060b] px-4 py-20">
        <article className="mx-auto max-w-2xl">
          <nav className="mb-8 flex items-center gap-2 text-sm text-white/40">
            <Link href="/en" className="hover:text-brand-400 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/en/blog" className="hover:text-brand-400 transition">
              Blog
            </Link>
            <span>/</span>
            <span className="text-white/60 truncate">{post.title}</span>
          </nav>

          <time className="text-sm text-white/30">
            {new Date(post.date).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl leading-tight">
            {post.title}
          </h1>

          <p className="mt-4 text-sm text-white/40">
            Written by{" "}
            <Link href="/en/om" className="text-brand-400 transition hover:text-brand-300">
              {AUTHOR.name}
            </Link>
            , {AUTHOR.bio_en}.
            {post.updated !== post.date && (
              <>
                {" "}
                Updated{" "}
                {new Date(post.updated).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </>
            )}
          </p>

          <div
            className="prose-blog mt-10"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          <section className="mt-16 glass rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-white">Ready to rent? Book your speaker now</h2>
            <p className="mt-2 text-white/50 text-sm">
              From {startPrisDkk()}/weekend. Collect Friday, return Monday.
            </p>
            <Link
              href="/en#book"
              className="mt-4 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-black hover:bg-brand-400 transition"
            >
              Book now
            </Link>
          </section>

          <Link
            href="/en/blog"
            className="mt-10 inline-block text-sm text-white/40 hover:text-brand-400 transition"
          >
            &larr; Back to the blog
          </Link>
        </article>
      </main>
    </>
  );
}
