"use client";
import {useState} from 'react';
import Link from 'next/link';
import {eventSituations} from '@/lib/eventSituations';
import {localizedHref} from '@/lib/enPages';
import type {Locale} from '@/lib/i18n';
import BundleGrid from './BundleGrid';
export default function ShopPackagePicker({locale}:{locale:Locale}) {
 const [slug,setSlug]=useState('fredagsbar');const en=locale==='en';const situation=eventSituations.find(s=>s.slug===slug)!;
 return <div id="shop-pakker" className="scroll-mt-24 pt-8"><div className="mx-auto max-w-6xl px-4"><h2 className="mb-6 text-3xl font-semibold">{en?'Find your package':'Find jeres pakke'}</h2><div className="flex flex-wrap gap-2" aria-label={en?'Choose occasion':'Vælg anledning'}>{eventSituations.map(s=><button key={s.slug} type="button" aria-pressed={slug===s.slug} onClick={()=>setSlug(s.slug)} style={{color:slug===s.slug?'#fff':undefined}} className={`rounded-md border px-4 py-2 text-sm ${slug===s.slug?'border-brand-600 bg-brand-600 text-white':'border-slate-200 bg-white text-slate-700 hover:border-brand-600'}`}>{s[locale].title}</button>)}</div></div><BundleGrid locale={locale} ids={[...situation.packageIds]} title={situation[locale].title} subtitle={en?'See what is included, compare prices and book online. VAT included.':'Se indhold, sammenlign priser og book online. Priserne er inklusive moms.'} note={<Link className="font-semibold text-brand-600" href={localizedHref(`/events/${slug}`,locale)}>{en?'See all packages and equipment for this occasion':'Se alle pakker og udstyr til anledningen'} →</Link>}/></div>;
}
