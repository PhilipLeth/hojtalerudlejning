/**
 * Hvem der står bag teksterne.
 *
 * Blogindlæggene var skrevet af "Scharling Studio" — altså af et firma, ikke af
 * et menneske. Både Googles egen vejledning om AI-søgning og svarmaskinerne
 * vægter, om der står en navngiven person med reel erfaring bag et råd. Den
 * person findes allerede: Frederik Scharling, som /om-siden fortæller om.
 * Oplysningerne herunder er hentet derfra og skal blive ved med at passe med
 * den side — se eeat.test.ts.
 */

export const AUTHOR = {
  name: "Frederik Scharling",
  /** Titel i Person-markup */
  jobTitle: "Lydtekniker og indehaver",
  /** Kort erfaringslinje — vist under overskriften på blogindlæg */
  bio: "har arbejdet med lyd, events og musikproduktion i mere end 15 år og driver Lejhøjtaler.dk i København",
  /** Siden der dokumenterer erfaringen */
  url: "https://lejhojtaler.dk/om",
} as const;

/** Person-objekt til Article-markup. */
export function authorLd() {
  return {
    "@type": "Person",
    name: AUTHOR.name,
    jobTitle: AUTHOR.jobTitle,
    description: `${AUTHOR.name} ${AUTHOR.bio}.`,
    url: AUTHOR.url,
    worksFor: {
      "@type": "Organization",
      name: "Lejhøjtaler.dk",
      url: "https://lejhojtaler.dk",
    },
  };
}
