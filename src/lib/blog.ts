import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import type { Locale } from "@/lib/i18n";

/**
 * Hvor indlæggene bor.
 *
 * De danske ligger i docs/, de engelske i docs/en/. Bloggen var det sidste
 * sted, /en stadig viste dansk: /en/blog listede de danske indlæg og linkede
 * til /blog/<slug>, så en engelsk læser klikkede fra en engelsk overskrift ind
 * i dansk brødtekst.
 *
 * Et indlæg findes kun på de sprog, det er SKREVET på — der er ingen fallback.
 * Et halvt oversat blogindeks er værre end et kort et.
 */
function dirFor(locale: Locale): string {
  return locale === "en"
    ? path.join(process.cwd(), "docs", "en")
    : path.join(process.cwd(), "docs");
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  /**
   * Sidst opdateret. Sættes med `updated:` i frontmatter, når et indlæg
   * gennemgås — fx når en pris ændrer sig. Uden den ser en guide fra 2026
   * lige så gammel ud om to år, og både Google og svarmaskinerne foretrækker
   * indhold, de kan se er vedligeholdt. Falder tilbage på udgivelsesdatoen.
   */
  updated: string;
  keywords: string[];
  image?: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

/**
 * Hvilket dansk indlæg et engelsk er oversættelsen af.
 *
 * Slug'ene er IKKE ens: den danske bærer et dansk søgeord ("lyd-til-havefest"),
 * den engelske et engelsk ("garden-party-sound"). Det er med vilje — en URL er
 * et søgeord — men det betyder, at hreflang ikke kan udledes af stien, som den
 * kan for resten af sitet. Derfor står parrene her.
 *
 * Et indlæg uden makker får ingen `languages`: at påstå et modstykke, der ikke
 * findes, er værre end at lade være. speaker-rental-copenhagen har aldrig haft
 * en dansk udgave — den blev skrevet på engelsk fra starten.
 */
export const BLOG_PAIRS: Record<string, string> = {
  "cheap-speaker-rental-copenhagen": "billig-hojtaler-leje",
  "party-lights-guide": "festlys-guide",
  "birthday-party-sound": "foedselsdagsfest-lyd",
  "speaker-on-a-bike-copenhagen": "hojtaler-paa-cykel-kobenhavn",
  "which-speaker-for-your-party": "hojtaler-til-fest",
  "garden-party-sound": "lyd-til-havefest",
  "pa-system-for-a-party": "musikanlaeg-til-fest",
  "about-lejhojtaler": "om-lejhojtaler",
  "pa-system-rental-copenhagen": "pa-anlaeg-udlejning-kobenhavn",
  "soundboks-alternative-copenhagen": "soundboks-alternativ-kobenhavn",
};

/** Den danske sti et engelsk indlæg er oversættelse af — eller undefined. */
export function daBlogPath(enSlug: string): string | undefined {
  const da = BLOG_PAIRS[enSlug];
  return da ? `/blog/${da}` : undefined;
}

/** Det engelske indlæg der oversætter et dansk — eller undefined. */
export function enBlogSlug(daSlug: string): string | undefined {
  return Object.keys(BLOG_PAIRS).find((en) => BLOG_PAIRS[en] === daSlug);
}

export function getAllPosts(locale: Locale = "da"): PostMeta[] {
  const dir = dirFor(locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const posts: PostMeta[] = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
    const { data } = matter(raw);

    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "2026-01-01",
      updated: data.updated ?? data.date ?? "2026-01-01",
      keywords: data.keywords ?? [],
      image: data.image,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Fjerner en indledende H1 fra brødteksten.
 *
 * Alle 11 indlæg begyndte med "# Overskrift", samtidig med at siden selv satte
 * `<h1>{post.title}</h1>`. Læseren så overskriften to gange, og siden havde to
 * H1'er — en crawler kan ikke afgøre, hvad den så handler om. Frontmatterens
 * `title` er den rigtige kilde: den bruges også i <title>, i OG-tags og i
 * Article-markup.
 *
 * Gøres her og ikke ved at rette de 11 filer, så det næste indlæg heller ikke
 * kan komme til at gøre det. En H2 længere nede i teksten røres ikke.
 */
function stripLeadingH1(content: string): string {
  return content.replace(/^\s*#\s+.*(\r?\n)+/, "");
}

export async function getPostBySlug(slug: string, locale: Locale = "da"): Promise<Post> {
  const raw = fs.readFileSync(path.join(dirFor(locale), `${slug}.md`), "utf-8");
  const { data, content } = matter(raw);

  const result = await remark().use(html).process(stripLeadingH1(content));

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "2026-01-01",
    updated: data.updated ?? data.date ?? "2026-01-01",
    keywords: data.keywords ?? [],
    image: data.image,
    contentHtml: result.toString(),
  };
}
