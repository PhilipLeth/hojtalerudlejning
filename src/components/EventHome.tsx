import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { eventSolutions, solutionHref } from "@/lib/eventSolutions";
import { localizedHref } from "@/lib/enPages";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import Footer from "@/components/Footer";
import PhoneLink from "@/components/PhoneLink";
import EventInquiryForm from "@/components/EventInquiryForm";
import styles from "./EventHome.module.css";

export default function EventHome({locale = "da", detail = false, cases = false}: {locale?: Locale; detail?: boolean; cases?: boolean}) {
  const en = locale === "en";
  const href = (p: string) => localizedHref(p, locale);
  return <main className={styles.page} lang={locale}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.location}>{en ? "Sound, light & AV in Copenhagen" : "Lyd, lys & AV i København"}</p>
        <h1>{cases ? (en ? "Technology that fits the room." : "Teknik, der passer ind i rummet.") : detail ? (en ? "A complete setup for your event." : "En samlet løsning til jeres event.") : (en ? "You bring people together. We take care of the AV." : "I samler mennesker. Vi sørger for teknikken.")}</h1>
        <p className={styles.lead}>{en ? "From the first presentation to the final applause. Sound, screens, microphones and lighting — planned, delivered and set up for your event." : "Fra den første præsentation til den sidste applaus. Lyd, skærme, mikrofoner og lys — planlagt, leveret og sat op til jeres arrangement."}</p>
        <div className={styles.actions}><Link className={styles.primary} href={href("/eventloesninger")+"#foresp"}>{en ? "Tell us about your event" : "Fortæl om jeres event"}</Link><a className={styles.textLink} href="#loesninger">{en ? "Explore solutions" : "Se løsningerne"} <span aria-hidden>↗</span></a></div>
        <p className={styles.heroNote}>{en ? "One point of contact. One agreed plan." : "Én kontaktperson. Én aftalt plan."}</p>
      </div>
      <figure className={styles.heroImage}><img src="/images/events/reception-detail.webp" alt={en ? "Discreet speaker installation and mixing desk in a restaurant overlooking Copenhagen" : "Diskret højtaleropstilling og mixer i restaurant med udsigt over København"} width="1200" height="1600" fetchPriority="high"/><figcaption>{en ? "A discreet setup, close up" : "En diskret opstilling, tæt på"}<span>{en ? "Sound in the room" : "Lyd i rummet"}</span></figcaption></figure>
    </section>
    <div className={styles.serviceLine}><span>{en ? "Planning & advice" : "Planlægning & rådgivning"}</span><span>{en ? "Delivery & setup" : "Levering & opsætning"}</span><span>{en ? "Soundcheck & handover" : "Lydprøve & gennemgang"}</span><span>{en ? "Technician by agreement" : "Tekniker efter aftale"}</span></div>
    <section id="loesninger" className={styles.section}>
      <div className={styles.sectionHead}><h2>{en ? "Start with the occasion." : "Begynd med anledningen."}</h2><p>{en ? "Four starting points. The final equipment, staffing and price are tailored to your venue and programme." : "Fire udgangspunkter. Det endelige udstyr, bemanding og pris tilpasses jeres lokale og program."}</p></div>
      <div className={detail ? styles.detailGrid : styles.grid}>
      {eventSolutions.map(s=>{const c=s[locale]; return <article className={styles.solution} key={s.id} id={s.id}>
        <Link href={detail ? solutionHref(s.id,locale) : href("/eventloesninger")+"#"+s.id} className={styles.solutionImage}><img src={`/images/events/${s.image}.webp`} alt={c.title+" — "+c.intro} width="1000" height="667" loading="lazy"/><span>{s.id==="reception" ? (en ? "Setup photo" : "Foto af opstilling") : (en ? "Illustrative setup" : "Illustreret opstilling")}</span></Link>
        <div className={styles.solutionBody}><p className={styles.audience}>{c.audience}</p><h3>{c.title}</h3><p>{c.intro}</p>
        {detail && <><ul>{c.equipment.map(item=><li key={item}>{item}</li>)}</ul><p>{c.service}</p><div className={styles.example}><strong>{en ? "Example scenario" : "Eksempel på anvendelse"}</strong><p>{c.example}</p></div><p className={styles.note}>{c.note}</p></>}
        <Link className={styles.textLink} href={detail ? solutionHref(s.id,locale) : href("/eventloesninger")+"#"+s.id}>{detail ? (en ? "Request a complete quote" : "Få et samlet tilbud") : (en ? "See the solution" : "Se løsningen")} <span aria-hidden>↗</span></Link></div>
      </article>})}</div>
      <p className={styles.note}>{en ? "A complete quote specifies equipment, delivery, setup, collection and any technician time. No booking is confirmed until scope and availability are agreed." : "Det samlede tilbud specificerer udstyr, levering, opsætning, afhentning og eventuel teknikertid. Opgaven bekræftes, når omfang og tilgængelighed er aftalt."}</p>
    </section>
    <section id="cases" className={styles.caseSection}>
      <div className={styles.casePhoto}><img src="/images/events/reception-front.webp" alt={en ? "Two EV speakers discreetly placed beside a restaurant bar" : "To EV-højtalere placeret diskret ved en restaurantbar"} width="1200" height="1600" loading="lazy"/></div>
      <div className={styles.caseCopy}><p>{en ? "From a real setup" : "Fra en konkret opstilling"}</p><h2>{en ? "The room comes first." : "Rummet kommer først."}</h2><p>{en ? "Good event sound does not have to dominate the space. Here, two speakers sit beside the bar, with the mixer kept to the side. A simple starting point for music and spoken presentations." : "God eventlyd behøver ikke fylde i indretningen. Her står to højtalere ved baren, mens mixeren er placeret til siden. Et enkelt udgangspunkt for musik og taler."}</p><dl><div><dt>{en ? "The setup" : "Opstillingen"}</dt><dd>{en ? "Two EV speakers on stands and a mixing desk" : "To EV-højtalere på stativer og en mixer"}</dd></div><div><dt>{en ? "The approach" : "Tilgangen"}</dt><dd>{en ? "Placement that works with the room and guest flow" : "Placering med respekt for rum og gæsternes færden"}</dd></div></dl><Link className={styles.textLink} href={cases ? solutionHref("reception",locale) : href("/cases")}>{en ? "Discuss a similar setup" : "Tal med os om en lignende opstilling"} <span aria-hidden>↗</span></Link></div>
    </section>
    <section className={styles.section}><div className={styles.sectionHead}><h2>{en ? "From your brief to a ready room." : "Fra jeres idé til et rum, der er klar."}</h2><p>{en ? "A practical plan before the equipment arrives." : "En praktisk plan, før udstyret ankommer."}</p></div><ol className={styles.process}>{(en ? [["Tell us what is happening","Date, venue, audience and programme. We clarify what the AV needs to do."],["Agree the whole setup","You receive a quote with equipment, delivery and staffing clearly described."],["Arrive ready to begin","We set up, test and hand over. On-site operation and collection follow the agreed plan."]] : [["Fortæl, hvad der skal ske","Dato, lokale, deltagere og program. Vi afklarer, hvad teknikken skal kunne."],["Aftal hele løsningen","I får et tilbud, hvor udstyr, transport og bemanding er beskrevet tydeligt."],["Mød op til en klar opstilling","Vi stiller op, tester og gennemgår. Afvikling og afhentning følger den aftalte plan."]]).map(([title,text],i)=><li key={title}><span>{i+1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
    <section className={styles.equipment}><h2>{en ? "Just need the equipment?" : "Har I selv styr på teknikken?"}</h2><p>{en ? "You can still hire individual products and book online." : "I kan stadig leje enkeltdele og booke online."}</p><div>{[["/skaerm",en?"Displays":"Skærme"],["/projektor",en?"Projectors":"Projektorer"],["/lej-mikrofon",en?"Microphones":"Mikrofoner"],["/lej-hojtaler",en?"Speakers":"Højtalere"],["/uplights","Uplights"],["/mixer",en?"Mixers":"Mixere"]].map(([p,label])=><Link href={href(p)} key={p}>{label} <span aria-hidden>↗</span></Link>)}</div><p className={styles.note}><Link href={href("/festpakke-150")}>{en ? "Party package 150" : "Festpakke 150"}</Link> · <Link href={href("/festpakke-250")}>{en ? "Party package 250" : "Festpakke 250"}</Link></p></section>
    <section id="foresp" className={styles.inquiry}><div><h2>{en ? "What are you planning?" : "Hvad skal I samle mennesker om?"}</h2><p>{en ? "Tell us about the occasion. We will help define a suitable setup and a complete quote." : "Fortæl om arrangementet. Vi hjælper med at afgrænse en passende løsning og et samlet tilbud."}</p><PhoneLink className={styles.phone}/><p>{en ? "Prefer to talk it through? Give us a call." : "Vil I hellere vende det i telefonen? Ring til os."}</p></div><div><span id="tilbud"/><EventInquiryForm locale={locale}/></div></section>
    <LocalBusinessJsonLd extra={{ description: en ? "Sound, light and AV for events in Copenhagen" : "Lyd, lys og AV til events i København" }}/><Footer locale={locale}/>
  </main>;
}
