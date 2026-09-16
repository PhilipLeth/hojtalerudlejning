/** DJ-timer afregnes inklusive moms. DJ-pult er med, lyd/lys er separate varer. */
export const DJ_DAY_RATE = 1000;
export const DJ_NIGHT_RATE = 1500;
export const DJ_ID = "dj_musikafvikler";
export interface DjHours { before23: number; after23: number }
export const DJ_DEFAULT: DjHours = { before23: 3, after23: 0 };
export function priceDj(value: unknown): { hours: number; total: number; before23: number; after23: number } {
 const v=value as DjHours | null;
 if(!v || !Number.isInteger(v.before23) || !Number.isInteger(v.after23) || v.before23<0 || v.after23<0 || v.before23+v.after23<3 || v.before23+v.after23>24) throw new Error("DJ: vælg 3–24 hele timer i alt");
 return {before23:v.before23,after23:v.after23,hours:v.before23+v.after23,total:v.before23*DJ_DAY_RATE+v.after23*DJ_NIGHT_RATE};
}
export function djLabel(v:DjHours,locale:"da"|"en"="da") {
 const p=priceDj(v);
 return locale==="en"?`DJ with booth, ${p.hours} hours (${p.before23} before 23:00, ${p.after23} after 23:00)`:`DJ med pult, ${p.hours} timer (${p.before23} før kl. 23, ${p.after23} efter kl. 23)`;
}
