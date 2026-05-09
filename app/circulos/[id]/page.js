'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatBirthday(dateStr) {
  if (!dateStr) return 'Sin fecha';
  const parts = dateStr.split('T')[0].split('-');
  const mes = MESES[parseInt(parts[1], 10) - 1];
  const dia = parseInt(parts[2], 10);
  return `${dia} de ${mes}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = dateStr.split('T')[0].split('-');
  const d = new Date(today.getFullYear(), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (d < today) d.setFullYear(today.getFullYear() + 1);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

export default function CirculoDetalle() {
  const router = useRouter();
  const { id } = useParams();
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [form, setForm] = useState({ name: '', dia: '', mes: '', phone: '', note: '', emoji: '🎂' });
  const [saving, setSaving] = useState(false);

  const EMOJIS = ['🎂', '👦', '👧', '👨', '👩', '🧒', '👴', '👵'];
  const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.getCircle(id)
      .then(setCircle)
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddPerson = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      // Armamos fecha como 2000-MM-DD (año fijo, solo importa día/mes)
      const birthday_date = form.dia && form.mes
        ? `2000-${String(form.mes).padStart(2, '0')}-${String(form.dia).padStart(2, '0')}`
        : null;
      const person = await api.addPersonToCircle(id, { ...form, birthday_date });
      setCircle(prev => ({ ...prev, people: [...(prev.people || []), person] }));
      setShowAddPerson(false);
      setForm({ name: '', dia: '', mes: '', phone: '', note: '', emoji: '🎂' });
    } catch (e) {
      alert('Error al agregar persona');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = () => {
    const url = `${window.location.origin}/circulos/join/${circle.invite_code}`;
    const text = `Te invito a unirte al círculo "${circle.name}" en Celebra 🎉\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/circulos/join/${circle.invite_code}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#7C3AED', fontSize: '15px' }}>Cargando...</p>
    </div>
  );

  if (!circle) return null;

  const sortedPeople = [...(circle.people || [])].sort((a, b) => {
    const da = daysUntil(a.birthday_date) ?? 999;
    const db = daysUntil(b.birthday_date) ?? 999;
    return da - db;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#6B3FD4', padding: '52px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '34px', height: '34px', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>{circle.emoji || '👥'}</span>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>{circle.name}</h1>
            </div>
            {circle.description && (
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '13px', margin: '4px 0 0' }}>{circle.description}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '8px' }}>
            {circle.people?.length || 0} personas
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '8px' }}>
            {circle.members?.length || 0} miembros
          </span>
          <span style={{ fontSize: '12px', color: circle.role === 'admin' ? '#F97316' : 'rgba(255,255,255,0.7)', background: circle.role === 'admin' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '8px' }}>
            {circle.role === 'admin' ? 'Admin' : 'Miembro'}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowAddPerson(true)} style={{ flex: 1, background: '#fff', color: '#5B21B6', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            🎂 Cargar cumpleaños
          </button>
          <button onClick={handleInvite} style={{ flex: 1, background: '#25D366', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            Invitar por WhatsApp
          </button>
        </div>

        {/* Link */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Link de invitación</p>
            <p style={{ fontSize: '13px', color: '#7C3AED', margin: 0, fontWeight: '500' }}>Código: {circle.invite_code}</p>
          </div>
          <button onClick={handleCopyLink} style={{ background: '#EDE9FE', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#6D28D9', fontWeight: '500', cursor: 'pointer' }}>
            Copiar
          </button>
        </div>

        {/* Cumpleaños */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px' }}>Cumpleaños</p>
          {sortedPeople.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '1px dashed #DDD6FE' }}>
              <p style={{ fontSize: '28px', margin: '0 0 10px' }}>🎂</p>
              <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                Todavía no hay cumpleaños cargados.<br />Tocá "Cargar cumpleaños" para empezar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedPeople.map(p => {
                const days = daysUntil(p.birthday_date);
                const soon = days !== null && days <= 7;
                return (
                  <div key={p.id} style={{ background: '#fff', borderRadius: '14px', border: soon ? '1.5px solid #F97316' : '0.5px solid rgba(0,0,0,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: soon ? '#FFF4ED' : '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      {p.emoji || '🎂'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '500', fontSize: '15px', color: '#1a1a1a', margin: '0 0 2px' }}>{p.name}</p>
                      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{formatBirthday(p.birthday_date)}</p>
                    </div>
                    {days !== null && (
                      <span style={{ fontSize: '11px', fontWeight: '600', color: soon ? '#F97316' : '#7C3AED', background: soon ? '#FFF4ED' : '#EDE9FE', padding: '4px 9px', borderRadius: '8px' }}>
                        {days === 0 ? '¡Hoy! 🎉' : days === 1 ? 'Mañana' : `${days}d`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Miembros */}
        {circle.members?.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px' }}>Miembros</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {circle.members.map(m => (
                <div key={m.id} style={{ background: '#fff', borderRadius: '14px', border: '0.5px solid rgba(0,0,0,0.06)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#6D28D9' }}>
                    {(m.name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <p style={{ flex: 1, fontSize: '14px', color: '#1a1a1a', margin: 0, fontWeight: '500' }}>{m.name}</p>
                  <span style={{ fontSize: '10px', color: m.role === 'admin' ? '#6D28D9' : '#aaa', background: m.role === 'admin' ? '#EDE9FE' : '#f5f5f5', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' }}>
                    {m.role === 'admin' ? 'Admin' : 'Miembro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', padding: '10px 0 20px' }}>
        <Link href="/dashboard" style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span style={{ fontSize: '10px', color: '#aaa', fontWeight: '500' }}>Inicio</span>
        </Link>
        <Link href="/circulos" style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></svg>
          <span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: '500' }}>Círculos</span>
        </Link>
        <Link href="/perfil" style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span style={{ fontSize: '10px', color: '#aaa', fontWeight: '500' }}>Perfil</span>
        </Link>
      </div>

      {/* Sheet — Agregar persona */}
      {showAddPerson && (
        <div onClick={() => setShowAddPerson(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,10,60,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 16px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: '36px', height: '4px', background: '#E5E7EB', borderRadius: '99px', margin: '12px auto 20px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a', letterSpacing: '-0.02em', margin: '0 0 20px' }}>Cargar cumpleaños</h2>

            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px' }}>Ícono</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setForm({ ...form, emoji: em })}
                  style={{ width: '40px', height: '40px', borderRadius: '10px', border: form.emoji === em ? '2px solid #7C3AED' : '1.5px solid #e5e7eb', background: form.emoji === em ? '#EDE9FE' : '#fff', fontSize: '20px', cursor: 'pointer' }}>
                  {em}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>Nombre *</p>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Sofía"
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
            />

            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>Fecha de cumpleaños</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <select
                value={form.dia}
                onChange={e => setForm({ ...form, dia: e.target.value })}
                style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', outline: 'none', background: '#fff', color: form.dia ? '#1a1a1a' : '#aaa' }}>
                <option value="">Día</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={form.mes}
                onChange={e => setForm({ ...form, mes: e.target.value })}
                style={{ flex: 2, border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', outline: 'none', background: '#fff', color: form.mes ? '#1a1a1a' : '#aaa' }}>
                <option value="">Mes</option>
                {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>

            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>Teléfono del adulto/responsable (opcional)</p>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Ej: 11 1234-5678"
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
            />

            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>Nota (opcional)</p>
            <input
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="Ej: Alérgico al maní"
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
            />

            <button
              onClick={handleAddPerson}
              disabled={saving || !form.name.trim()}
              style={{ width: '100%', background: saving || !form.name.trim() ? '#c4b5fd' : '#7C3AED', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
