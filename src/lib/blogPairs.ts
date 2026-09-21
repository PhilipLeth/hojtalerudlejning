/**
 * Parrene mellem danske og engelske blogindlæg — uden fs.
 *
 * Lå i blog.ts, som læser filer fra disken og derfor ikke kan importeres i en
 * klientkomponent. Sprogskifteren i headeren er en klientkomponent, og uden
 * parrene oversatte den stien blindt: fra /en/blog/garden-party-sound pegede
 * "DA" på /blog/garden-party-sound, en side der ikke findes. Tolv engelske
 * blogindlæg havde hver sit døde link.
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


