import {useState} from "react";
import {render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe,it,expect} from "vitest";
import DjHoursPicker from "@/components/DjHoursPicker";
import {DJ_DEFAULT} from "@/lib/dj";
function Harness(){const [hours,setHours]=useState(DJ_DEFAULT);return <DjHoursPicker value={hours} onChange={setHours}/>;}
describe("DJ-timevalg",()=>{
 it("opdaterer den samlede pris når timer flyttes over kl. 23",async()=>{const user=userEvent.setup();render(<Harness/>);expect(screen.getByText('3.000 kr inkl. moms')).toBeInTheDocument();await user.selectOptions(screen.getByLabelText(/Timer efter kl. 23/),'2');await user.selectOptions(screen.getByLabelText(/Timer før kl. 23/),'2');expect(screen.getByText('5.000 kr inkl. moms')).toBeInTheDocument();});
 it("holder minimum tre timer og viser natprisen korrekt",async()=>{const user=userEvent.setup();render(<Harness/>);await user.selectOptions(screen.getByLabelText(/Timer før kl. 23/),'0');expect(screen.getByLabelText(/Timer efter kl. 23/)).toHaveValue('3');expect(screen.getByText('4.500 kr inkl. moms')).toBeInTheDocument();});
});
