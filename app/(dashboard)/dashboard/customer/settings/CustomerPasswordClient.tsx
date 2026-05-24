"use client";

import { useState } from "react";

const ic = "w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/20 text-sm transition-all";

export default function CustomerPasswordClient() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ text: "Yeni şifreler eşleşmiyor", ok: false }); return;
    }
    if (form.newPassword.length < 6) {
      setMsg({ text: "Yeni şifre en az 6 karakter olmalı", ok: false }); return;
    }
    setLoading(true); setMsg({ text: "", ok: false });
    const res = await fetch("/api/profile/password", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ text: "Şifre başarıyla güncellendi ✓", ok: true });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMsg({ text: "", ok: false }), 3000);
    } else {
      setMsg({ text: data.error, ok: false });
    }
  }

  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="text-white font-semibold mb-1">Şifre Değiştir</h2>
      <p className="text-zinc-600 text-xs mb-5">Hesabınızın güvenliği için güçlü bir şifre kullanın</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Mevcut Şifre</label>
          <input type="password" value={form.currentPassword}
            onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
            placeholder="••••••••" required className={ic} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Yeni Şifre</label>
          <input type="password" value={form.newPassword}
            onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
            placeholder="En az 6 karakter" required className={ic} />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wider">Yeni Şifre Tekrar</label>
          <input type="password" value={form.confirmPassword}
            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="••••••••" required className={ic} />
          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-red-400 text-xs mt-1.5">Şifreler eşleşmiyor</p>
          )}
          {form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword && form.newPassword.length >= 6 && (
            <p className="text-green-400 text-xs mt-1.5">✓ Şifreler eşleşiyor</p>
          )}
        </div>
        {msg.text && (
          <div className={`rounded-2xl px-4 py-3 text-sm ${msg.ok ? "bg-green-950/40 border border-green-800/40 text-green-400" : "bg-red-950/40 border border-red-800/40 text-red-400"}`}>
            {msg.text}
          </div>
        )}
        <button type="submit" disabled={loading}
          className="bg-white text-zinc-900 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50">
          {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </section>
  );
}
