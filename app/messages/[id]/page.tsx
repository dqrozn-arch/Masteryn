import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChatWindow from "./ChatWindow";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, surname: true, avatar: true, userId: true } },
      barber:   { select: { id: true, name: true, surname: true, salonName: true, avatar: true, userId: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conv) notFound();

  // Erişim kontrolü
  const isCustomer = session.userType === "CUSTOMER" && conv.customer.userId === session.id;
  const isBarber   = session.userType === "BARBER"   && conv.barber.userId === session.id;
  if (!isCustomer && !isBarber) redirect("/login");

  const backUrl = isCustomer ? "/dashboard/customer/messages" : "/dashboard/barber/messages";

  return (
    <ChatWindow
      conversationId={id}
      isBarber={isBarber}
      initialMessages={conv.messages as never}
      customer={conv.customer}
      barber={conv.barber}
      backUrl={backUrl}
    />
  );
}
