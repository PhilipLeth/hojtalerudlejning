import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const docsDir = path.join(process.cwd(), "docs");

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

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));

  const posts: PostMeta[] = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(docsDir, filename), "utf-8");
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

export async function getPostBySlug(slug: string): Promise<Post> {
  const raw = fs.readFileSync(path.join(docsDir, `${slug}.md`), "utf-8");
  const { data, content } = matter(raw);

  const result = await remark().use(html).process(content);

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
