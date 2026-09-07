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

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.getCircle(id)
      .then(setCircle)
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, [id, router]);

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
            👤 Agregar integrante
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
                Todavía no hay cumpleaños cargados.<br />Agregá integrantes para completar el calendario.
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

      {/* Sheet — Agregar integrante */}
      {showAddPerson && (
        <div onClick={() => setShowAddPerson(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,10,60,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 16px 40px' }}>
            <div style={{ width: '36px', height: '4px', background: '#E5E7EB', borderRadius: '99px', margin: '12px auto 20px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '-0.02em', margin: '0 0 8px' }}>Agregar integrante</h2>
            <p style={{ fontSize:'14px', color:'#777', lineHeight:'1.5', margin:'0 0 20px' }}>
              Compartí la invitación. Cuando la persona ingrese, su nombre y cumpleaños se agregarán automáticamente desde su perfil.
            </p>
            <button onClick={handleInvite}
              style={{ width:'100%', background:'#25D366', color:'#fff', border:'none', borderRadius:'14px', padding:'15px', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginBottom:'10px' }}>
              Invitar por WhatsApp
            </button>
            <button onClick={handleCopyLink}
              style={{ width:'100%', background:'#EDE9FE', color:'#6D28D9', border:'none', borderRadius:'14px', padding:'15px', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}>
              Copiar enlace de invitación
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
