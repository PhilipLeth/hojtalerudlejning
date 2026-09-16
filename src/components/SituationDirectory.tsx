"use client";
import Link from 'next/link';
import {eventSituations, situationImageIsProduct, situationImageSrc} from '@/lib/eventSituations';
import {useProducts} from '@/lib/useProducts';
import {localizedHref} from '@/lib/enPages';
import type {Locale} from '@/lib/i18n';
import styles from './EventHome.module.css';
export default function SituationDirectory({locale='da'}:{locale?:Locale}) {
 const en=locale==='en';const {rentalProducts}=useProducts();
 return <section className={styles.section} id="situationer"><div className={styles.sectionHead}><h2>{en?'Shop by occasion':'Shop efter anledning'}</h2><p>{en?'Relevant packages for every occasion. Choose the size and book your equipment online.':'Relevante pakker til hver anledning. Vælg størrelse og book udstyret online.'}</p></div><div className={styles.situationCards}>{eventSituations.map(s=>{const packages=rentalProducts.filter(p=>(s.packageIds as readonly string[]).includes(p.id));const price=packages.length?Math.min(...packages.map(p=>p.price)):null;return <Link className={styles.situationCard} key={s.slug} href={localizedHref(`/events/${s.slug}`,locale)}><img src={situationImageSrc(s.image)} alt="" width="400" height="200" loading="lazy" className={situationImageIsProduct(s.image)?styles.productThumb:undefined}/><div><h3>{s[locale].title}</h3><p>{en?'Compare equipment packages':'Sammenlign udstyrspakker'}</p>{price!==null&&<strong>{en?'From':'Fra'} {price.toLocaleString(en?'en-GB':'da-DK')} {en?'DKK':'kr'} →</strong>}</div></Link>})}</div></section>;
}
