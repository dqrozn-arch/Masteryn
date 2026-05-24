import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerAppointmentsClient from "./CustomerAppointmentsClient";

export default async function RandevularPage() {
  const session = await getSession();
  if (!session || session.userType !== "CUSTOMER") redirect("/login");
  return <CustomerAppointmentsClient />;
}
