"use client";
import {useState} from "react";
import type {Locale} from "@/lib/i18n";
import styles from "./EventHome.module.css";
// Messe- og koncertillustrationerne (slide 4 og 5) er fjernet 28. sept 2026
const slides=[
 {image:'reception-detail-v2',da:'Lyd til receptionen',en:'Sound for a reception',real:true},
 {image:'reception-front-v2',da:'Diskret lyd ved baren',en:'Discreet sound beside the bar',real:true},
 {image:'meeting',da:'Skærm og lyd til mødet',en:'Display and sound for a meeting',real:false},
];
export default function EventHeroGallery({locale}:{locale:Locale}) {
 const [index,setIndex]=useState(0);const en=locale==='en';const slide=slides[index];
 return <figure className={styles.heroImage}><button type="button" className={styles.galleryButton} aria-label={en?'Show next setup':'Vis næste opstilling'} onClick={()=>setIndex(i=>(i+1)%slides.length)}><img key={slide.image} className={styles.gallerySlide} src={`/images/events/${slide.image}.webp`} alt={slide[locale]} width="1200" height="1600" fetchPriority="high"/><span className={styles.galleryNext} aria-hidden>→</span></button><figcaption aria-live="polite"><span>{slide[locale]} · {slide.real?(en?'Actual setup':'Foto af opstilling'):(en?'Illustration':'Illustration')}</span><span>{index+1}/{slides.length}</span></figcaption></figure>;
}
