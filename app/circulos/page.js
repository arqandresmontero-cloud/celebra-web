'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken, deleteCircle } from '@/lib/api';

export default function Circulos() {
  const router = useRouter();
  const [circles, setCircles] = useState([]);
  const [swipeX, setSwipeX] = useState({});
  const [deleting, setDeleting] = useState(null);
  const touchStart = {};

  const handleTouchStart = (id, e) => {
    touchStart[id] = e.touches[0].clientX;
  };
  const handleTouchEnd = (id, e) => {
    const diff = touchStart[id] - e.changedTouches[0].clientX;
    if (diff > 60) setSwipeX(prev => ({ ...prev, [id]: -80 }));
    else setSwipeX(prev => ({ ...prev, [id]: 0 }));
  };
  const handleDelete = async (id) => {
    if (!confirm('¿Borrar este círculo?')) return;
    setDeleting(id);
    try {
      await deleteCircle(id);
      setCircles(circles.filter(c => c.id !== id));
    } catch(e) { alert('Error al borrar'); }
    setDeleting(null);
  };
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', emoji: '👥', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.getCircles()
      .then(setCircles)
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const circle = await api.createCircle(form);
      setCircles([circle, ...circles]);
      setShowNew(false);
      setForm({ name: '', emoji: '👥', description: '' });
      router.push('/circulos/' + circle.id);
    } catch (e) {
      alert('Error al crear el círculo');
    } finally {
      setSaving(false);
    }
  };

  const EMOJIS = ['👥', '👨‍👩‍👧‍👦', '🏫', '⚽', '🏢', '🎓', '🏠', '🎉'];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#7C3AED', fontSize: '15px' }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#6B3FD4', padding: '52px 20px 24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#fff', letterSpacing: '-1.5px', margin: '0 0 6px', lineHeight: 1 }}>
          celebra<span style={{ color: '#F97316' }}>.</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '14px', margin: 0 }}>Tus círculos</p>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Botón nuevo círculo */}
        <button
          onClick={() => setShowNew(true)}
          style={{ width: '100%', background: '#fff', color: '#5B21B6', border: 'none', borderRadius: '14px', padding: '16px 18px', fontSize: '17px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', cursor: 'pointer', marginBottom: '20px' }}>
          👥 Crear círculo
        </button>

        {/* Lista */}
        {circles.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '1px dashed #DDD6FE' }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px' }}>👥</p>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Todavía no tenés círculos.<br />Creá uno para organizar cumpleaños por grupo.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {circles.map(c => (
              <div key={c.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 16px 16px 0' }}
                  onClick={() => handleDelete(c.id)}>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{deleting === c.id ? '...' : 'Borrar'}</span>
                </div>
                <div
                  onTouchStart={e => handleTouchStart(c.id, e)}
                  onTouchEnd={e => handleTouchEnd(c.id, e)}
                  style={{ transform: `translateX(${swipeX[c.id] || 0}px)`, transition: 'transform 0.2s', position: 'relative', zIndex: 1 }}
                  onClick={() => { if (!swipeX[c.id]) router.push('/circulos/' + c.id); else setSwipeX(prev => ({ ...prev, [c.id]: 0 })); }}
                >
                  <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                      {c.emoji || '👥'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '500', fontSize: '16px', color: '#1a1a1a', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{c.name}</p>
                      <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                        {c.people_count || 0} personas · {c.member_count || 0} miembros
                      </p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '500', color: c.role === 'admin' ? '#6D28D9' : '#aaa', background: c.role === 'admin' ? '#EDE9FE' : '#f5f5f5', padding: '3px 8px', borderRadius: '6px' }}>
                      {c.role === 'admin' ? 'Admin' : 'Miembro'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Sheet — Nuevo círculo */}
      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,10,60,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 16px 40px' }}>
            <div style={{ width: '36px', height: '4px', background: '#E5E7EB', borderRadius: '99px', margin: '12px auto 20px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a', letterSpacing: '-0.02em', margin: '0 0 20px' }}>Nuevo círculo</h2>

            {/* Emoji picker */}
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 8px' }}>Ícono</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setForm({ ...form, emoji: em })}
                  style={{ width: '44px', height: '44px', borderRadius: '12px', border: form.emoji === em ? '2px solid #7C3AED' : '1.5px solid #e5e7eb', background: form.emoji === em ? '#EDE9FE' : '#fff', fontSize: '22px', cursor: 'pointer' }}>
                  {em}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>Nombre del círculo *</p>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: 1° grado A, Familia, Oficina"
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
            />

            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>Descripción (opcional)</p>
            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Ej: Sala de 5 del jardín Montessori"
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 14px', fontSize: '15px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
            />

            <button
              onClick={handleCreate}
              disabled={saving || !form.name.trim()}
              style={{ width: '100%', background: saving || !form.name.trim() ? '#c4b5fd' : '#7C3AED', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Creando...' : 'Crear círculo'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
