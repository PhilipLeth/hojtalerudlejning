import {useState} from "react";
import {render,screen,fireEvent} from "@testing-library/react";
import {describe,it,expect} from "vitest";
import DjHoursPicker from "@/components/DjHoursPicker";
import {DJ_DEFAULT, DJ_DELIVERY_KR, djHoursFromRange, priceDj} from "@/lib/dj";
function Harness({date}:{date?:Date|null}={}){const [hours,setHours]=useState(DJ_DEFAULT);return <DjHoursPicker value={hours} onChange={setHours} date={date}/>;}
describe("DJ-timevalg",()=>{
 it("regner start/slut over kl. 23 og viser tilbuddet",()=>{
  render(<Harness/>);
  expect(screen.getByText(`${(3000+DJ_DELIVERY_KR).toLocaleString("da-DK")} kr inkl. moms`)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Slut"),{target:{value:"01:00"}});
  fireEvent.change(screen.getByLabelText("Start"),{target:{value:"21:00"}});
  expect(screen.getByText(`${(5000+DJ_DELIVERY_KR).toLocaleString("da-DK")} kr inkl. moms`)).toBeInTheDocument();
 });
 it("viser natprisen for tre timer efter kl. 23",()=>{
  render(<Harness/>);
  fireEvent.change(screen.getByLabelText("Slut"),{target:{value:"02:00"}});
  fireEvent.change(screen.getByLabelText("Start"),{target:{value:"23:00"}});
  expect(screen.getByText(`${(4500+DJ_DELIVERY_KR).toLocaleString("da-DK")} kr inkl. moms`)).toBeInTheDocument();
 });
 it("kræver mindst tre timer",()=>{
  render(<Harness/>);
  fireEvent.change(screen.getByLabelText("Slut"),{target:{value:"19:00"}});
  expect(screen.getByText(/mindst 3 timer/)).toBeInTheDocument();
 });
});
describe("djHoursFromRange",()=>{
 it("splitter ved kl. 23 og går over midnat",()=>{
  expect(djHoursFromRange("18:00","21:00")).toMatchObject({before23:3,after23:0});
  expect(djHoursFromRange("21:00","01:00")).toMatchObject({before23:2,after23:2});
  expect(djHoursFromRange("23:00","02:00")).toMatchObject({before23:0,after23:3});
  expect(djHoursFromRange("18:00","20:00")).toBeNull();
 });
 it("lægger 20 % på i julefrokost-perioden",()=>{
  const peak=priceDj({before23:3,after23:0}, new Date(2026,8,16));
  expect(peak.peak).toBe(true);
  expect(peak.dayRate).toBe(1200);
  expect(peak.total).toBe(3600+DJ_DELIVERY_KR);
  const off=priceDj({before23:3,after23:0}, new Date(2026,0,10));
  expect(off.peak).toBe(false);
  expect(off.total).toBe(3000+DJ_DELIVERY_KR);
 });
});
