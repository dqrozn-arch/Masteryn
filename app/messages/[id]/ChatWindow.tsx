"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

type MsgType = "TEXT" | "IMAGE" | "AGREEMENT" | "SYSTEM";
type SenderType = "CUSTOMER" | "BARBER" | "SYSTEM";
type AgreementStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Msg {
  id: string; type: MsgType; senderType: SenderType; text?: string | null;
  imageUrl?: string | null; createdAt: string | Date;
  agreementService?: string | null; agreementPrice?: number | null;
  agreementDuration?: number | null; agreementStatus?: AgreementStatus | null;
}

interface Profile { id: string; name: string; surname: string; salonName?: string | null; avatar?: string | null; }

interface Props {
  conversationId: string; isBarber: boolean;
  initialMessages: Msg[];
  customer: Profile; barber: Profile;
  backUrl: string;
}

function Avatar({ name, avatar }: { name: string; avatar?: string | null }) {
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
      style={{ border: "1px solid #252525" }}>
      {avatar ? (
        <Image src={avatar} alt="" width={28} height={28} className="object-cover w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "linear-gradient(135deg,var(--gold-dark),var(--copper))" }}>
          {name[0]}
        </div>
      )}
    </div>
  );
}

function AgreementCard({ msg, convId, isBarber, onStatusChange }: {
  msg: Msg; convId: string; isBarber: boolean; onStatusChange: (id: string, s: AgreementStatus) => void;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    const res = await fetch(`/api/conversations/${convId}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: msg.id, action }),
    });
    setLoading(null);
    if (res.ok) onStatusChange(msg.id, action === "approve" ? "APPROVED" : "REJECTED");
  }

  const statusColor = msg.agreementStatus === "APPROVED" ? "border-green-500/30 bg-green-950/20"
    : msg.agreementStatus === "REJECTED" ? "border-red-500/20 bg-red-950/10"
    : "border-amber-400/25 bg-amber-950/15";

  return (
    <div className={`rounded-2xl p-4 border ${statusColor} max-w-xs`}>
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 100 100" className="flex-shrink-0">
          <defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFC28A"/><stop offset="100%" stopColor="#A8894E"/>
          </linearGradient></defs>
          <path d="M29,4 L71,4 L96,29 L96,71 L71,96 L29,96 L4,71 L4,29 Z" fill="url(#ag)"/>
          <path d="M32,50 L44,63 L68,37" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>Resmi Teklif</span>
        {msg.agreementStatus === "APPROVED" && <span className="text-[10px] text-green-400 ml-auto">✓ Onaylandı</span>}
        {msg.agreementStatus === "REJECTED" && <span className="text-[10px] text-red-400 ml-auto">✕ Reddedildi</span>}
      </div>
      {msg.agreementService && <p className="text-white text-sm font-medium mb-2">{msg.agreementService}</p>}
      <div className="flex gap-3 text-xs text-zinc-400 mb-2">
        {msg.agreementPrice && <span>💰 <strong className="text-white">{msg.agreementPrice.toLocaleString("tr-TR")} ₺</strong></span>}
        {msg.agreementDuration && <span>⏱ <strong className="text-white">{msg.agreementDuration} dk</strong></span>}
      </div>
      {msg.text && <p className="text-zinc-400 text-xs mb-3">{msg.text}</p>}
      {/* Müşteri onay butonu */}
      {!isBarber && msg.agreementStatus === "PENDING" && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => act("reject")} disabled={!!loading}
            className="flex-1 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            {loading === "reject" ? "..." : "Reddet"}
          </button>
          <button onClick={() => act("approve")} disabled={!!loading}
            className="flex-[2] py-2 rounded-xl text-xs font-bold text-zinc-900 transition-colors disabled:opacity-40"
            style={{ background: "var(--gold)" }}>
            {loading === "approve" ? "..." : "✓ Onayla"}
          </button>
        </div>
      )}
      {msg.agreementStatus === "APPROVED" && (
        <p className="text-green-400/70 text-[10px] mt-2">Masteryn Güvencesi kapsamında kayıt altına alındı.</p>
      )}
    </div>
  );
}

export default function ChatWindow({ conversationId, isBarber, initialMessages, customer, barber, backUrl }: Props) {
  const [messages, setMessages]     = useState<Msg[]>(initialMessages);
  const [text,     setText]         = useState("");
  const [sending,  setSending]      = useState(false);
  const [showAgreementForm, setAF]  = useState(false);
  const [agForm, setAgForm]         = useState({ service: "", price: "", duration: "", text: "" });
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const fileRef      = useRef<HTMLInputElement>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const otherSide = isBarber ? customer : barber;
  const otherName = isBarber ? `${customer.name} ${customer.surname}` : (barber.salonName ?? `${barber.name} ${barber.surname}`);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Polling — 4 saniyede bir yeni mesaj kontrol
  useEffect(() => {
    pollInterval.current = setInterval(async () => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data: Msg[] = await res.json();
        setMessages((prev) => data.length > prev.length ? data : prev);
      }
    }, 4000);
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [conversationId]);

  function onStatusChange(msgId: string, status: AgreementStatus) {
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, agreementStatus: status } : m));
  }

  function handleImageSelect(file: File) {
    setImageFile(file);
    const r = new FileReader();
    r.onload = (e) => setImgPreview(e.target?.result as string);
    r.readAsDataURL(file);
  }

  async function sendMessage(type: "TEXT" | "IMAGE" | "AGREEMENT" = "TEXT") {
    if (type === "TEXT" && !text.trim() && !imageFile) return;
    setSending(true);
    const fd = new FormData();
    fd.append("type", imageFile ? "IMAGE" : type);
    if (text.trim()) fd.append("text", text.trim());
    if (imageFile) fd.append("image", imageFile);
    if (type === "AGREEMENT") {
      fd.set("type", "AGREEMENT");
      fd.append("service",  agForm.service);
      fd.append("price",    agForm.price);
      fd.append("duration", agForm.duration);
      if (agForm.text) fd.set("text", agForm.text);
    }

    const res = await fetch(`/api/conversations/${conversationId}/messages`, { method: "POST", body: fd });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText(""); setImageFile(null); setImgPreview(null);
      setAF(false); setAgForm({ service: "", price: "", duration: "", text: "" });
    }
  }

  const mySide: SenderType = isBarber ? "BARBER" : "CUSTOMER";

  return (
    <div className="flex flex-col h-screen" style={{ background: "#080808" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b"
        style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
        <Link href={backUrl} className="text-zinc-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
        </Link>
        <Avatar name={otherSide.name} avatar={otherSide.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{otherName}</p>
          <p className="text-zinc-600 text-xs">Masteryn Güvenli Kanal</p>
        </div>
        <Logo size="sm" href="/" />
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Başlangıç bilgisi */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-zinc-500"
            style={{ background: "#111", border: "1px solid #1e1e1e" }}>
            🛡 Bu konuşma Masteryn Güvencesi kapsamında kayıt altındadır
          </div>
        </div>

        {messages.map((msg) => {
          const isMine   = msg.senderType === mySide;
          const isSystem = msg.senderType === "SYSTEM";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="px-4 py-2 rounded-xl text-xs max-w-xs text-center"
                  style={{ background: "#111", color: "#666", border: "1px solid #1e1e1e" }}>
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.type === "AGREEMENT") {
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <AgreementCard msg={msg} convId={conversationId} isBarber={isBarber} onStatusChange={onStatusChange} />
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
              {!isMine && <Avatar name={otherSide.name} avatar={otherSide.avatar} />}
              <div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-sm ${
                isMine ? "rounded-br-sm" : "rounded-bl-sm"
              }`} style={{
                background: isMine ? "var(--gold-dark)" : "#1a1a1a",
                color: isMine ? "#0a0a0a" : "#d4d4d4",
                border: isMine ? "none" : "1px solid #252525",
              }}>
                {msg.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden mb-2" style={{ maxWidth: "220px", aspectRatio: "4/3" }}>
                    <Image src={msg.imageUrl} alt="" fill className="object-cover" />
                  </div>
                )}
                {msg.text && <p className="leading-relaxed break-words">{msg.text}</p>}
                <p className={`text-[10px] mt-1 ${isMine ? "text-black/40 text-right" : "text-zinc-600"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Resmi Teklif formu (usta için) */}
      {showAgreementForm && isBarber && (
        <div className="px-4 py-3 border-t" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--gold)" }}>Resmi Teklif Oluştur</p>
          <div className="space-y-2">
            <input value={agForm.service} onChange={(e) => setAgForm((p) => ({ ...p, service: e.target.value }))}
              placeholder="İşlem adı (örn: Saç Boyama)" className="w-full text-sm px-3 py-2 rounded-xl text-white placeholder-zinc-600 focus:outline-none"
              style={{ background: "#161616", border: "1px solid #2a2a2a" }} />
            <div className="flex gap-2">
              <input value={agForm.price} onChange={(e) => setAgForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="Fiyat (₺)" type="number" className="flex-1 text-sm px-3 py-2 rounded-xl text-white placeholder-zinc-600 focus:outline-none"
                style={{ background: "#161616", border: "1px solid #2a2a2a" }} />
              <input value={agForm.duration} onChange={(e) => setAgForm((p) => ({ ...p, duration: e.target.value }))}
                placeholder="Süre (dk)" type="number" className="flex-1 text-sm px-3 py-2 rounded-xl text-white placeholder-zinc-600 focus:outline-none"
                style={{ background: "#161616", border: "1px solid #2a2a2a" }} />
            </div>
            <input value={agForm.text} onChange={(e) => setAgForm((p) => ({ ...p, text: e.target.value }))}
              placeholder="Ek not..." className="w-full text-sm px-3 py-2 rounded-xl text-white placeholder-zinc-600 focus:outline-none"
              style={{ background: "#161616", border: "1px solid #2a2a2a" }} />
            <div className="flex gap-2">
              <button onClick={() => setAF(false)} className="flex-1 py-2 rounded-xl text-xs text-zinc-400"
                style={{ background: "#1a1a1a" }}>İptal</button>
              <button onClick={() => sendMessage("AGREEMENT")} disabled={sending || !agForm.service || !agForm.price}
                className="flex-[2] py-2 rounded-xl text-xs font-bold text-zinc-900 disabled:opacity-40"
                style={{ background: "var(--gold)" }}>
                {sending ? "..." : "Teklifi Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Görsel önizleme */}
      {imgPreview && (
        <div className="px-4 py-2 border-t" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
          <div className="flex items-center gap-2">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={imgPreview} alt="" fill className="object-cover" />
            </div>
            <button onClick={() => { setImageFile(null); setImgPreview(null); }}
              className="text-zinc-500 hover:text-red-400 text-sm transition-colors">✕ Kaldır</button>
          </div>
        </div>
      )}

      {/* Input alanı */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
        <div className="flex items-end gap-2">
          {/* Ekler */}
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => fileRef.current?.click()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              style={{ background: "#161616", border: "1px solid #252525" }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
              </svg>
            </button>
            {isBarber && (
              <button onClick={() => { setAF(!showAgreementForm); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: showAgreementForm ? "var(--gold-subtle)" : "#161616", border: `1px solid ${showAgreementForm ? "var(--gold-border)" : "#252525"}`, color: showAgreementForm ? "var(--gold)" : "#666" }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Mesaj input */}
          <div className="flex-1">
            <input value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Mesaj yaz..."
              className="w-full px-4 py-2.5 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none"
              style={{ background: "#161616", border: "1px solid #252525" }} />
          </div>

          {/* Gönder */}
          <button onClick={() => sendMessage()} disabled={sending || (!text.trim() && !imageFile)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0"
            style={{ background: "var(--gold)", boxShadow: "0 0 12px var(--gold-glow)" }}>
            <svg className="w-4 h-4 text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
            </svg>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} />
        {isBarber && (
          <p className="text-zinc-700 text-[10px] mt-1.5 text-center">
            Görsel ikonu = fotoğraf · Belge ikonu = resmi teklif
          </p>
        )}
      </div>
    </div>
  );
}
