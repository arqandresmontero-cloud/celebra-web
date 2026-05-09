'use client';
import ActivarRegaloSheet from '@/components/ActivarRegaloSheet';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

function daysUntil(dateStr) {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setFullYear(today.getFullYear());
  date.setHours(0, 0, 0, 0);
  if (date < today) date.setFullYear(today.getFullYear() + 1);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

function formatAmount(n) {
  if (!n) return '$0';
  return '$' + Number(n).toLocaleString('es-AR');
}

function getEventEmoji(type, title) {
  const t = (title || '').toLowerCase();
  if (t.includes('casamiento') || t.includes('boda') || t.includes('matrimonio')) return '💍';
  if (t.includes('baby') || t.includes('bebé') || t.includes('bebe')) return '🍼';
  if (t.includes('graduaci')) return '🎓';
  if (t.includes('jubilaci')) return '🎊';
  return '🎂';
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [suggestedToActivate, setSuggestedToActivate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    Promise.all([api.me(), api.getEvents(), api.getSuggestedEvents()])
      .then(([u, e, s]) => { setUser(u); setEvents(e); setSuggested(s); })
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#7C3AED', fontSize: '15px' }}>Cargando...</p>
    </div>
  );

  const sorted = [...events].sort((a, b) => daysUntil(a.birthday_date) - daysUntil(b.birthday_date));

  // Combinar activos y sugeridos ordenados por fecha
  const allItems = [
    ...sorted.map(e => ({ ...e, _type: 'active' })),
    ...suggested.map(s => ({ ...s, _type: 'suggested' })),
  ].sort((a, b) => daysUntil(a.birthday_date || a.event_date) - daysUntil(b.birthday_date || b.event_date));

  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#6B3FD4', padding: '52px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#fff', letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>
            celebra<span style={{ color: '#F97316' }}>.</span>
          </h1>
          <button
            onClick={() => { removeToken(); router.push('/login'); }}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user ? (user.name || user.email || '').slice(0, 2).toUpperCase() : 'AM'}
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '14px', margin: 0, letterSpacing: '-0.01em' }}>
          Regalar, por fin simple.
        </p>
      </div>

      <div style={{ padding: '16px' }}>

        {/* CTA principal */}
        <button
          onClick={() => setShowSheet(true)}
          style={{ width: '100%', background: '#fff', color: '#5B21B6', border: 'none', borderRadius: '14px', padding: '16px 18px', fontSize: '17px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', cursor: 'pointer', letterSpacing: '-0.01em', marginBottom: '20px' }}>
          🎁 Crear regalo
        </button>

        {/* Próximos */}
        <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Próximos
        </p>

        {allItems.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '1px dashed #DDD6FE' }}>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Todavía no tenés regalos.<br />Tocá "Crear regalo" para empezar.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allItems.slice(0, 6).map((item) => {
              if (item._type === 'suggested') {
                const days = daysUntil(item.event_date);
                const date = new Date(item.event_date);
                const dateStr = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
                return (
                  <div key={'s-' + item.id} onClick={() => setSuggestedToActivate(item)} style={{ cursor: 'pointer' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px dashed #F97316', overflow: 'hidden', opacity: 0.95 }}>
                      <div style={{ background: '#FFF4ED', padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '2px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                          🎂
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: '500', fontSize: '16px', color: '#92400e', margin: '0 0 2px', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </p>
                          <p style={{ fontSize: '12px', color: '#F97316', margin: 0 }}>
                            Sugerido · Pendiente de activar
                          </p>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '4px 9px', borderRadius: '8px', whiteSpace: 'nowrap', alignSelf: 'flex-start', flexShrink: 0 }}>
                          {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : dateStr}
                        </div>
                      </div>
                      <div style={{ padding: '10px 16px 12px', display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#F97316' }}>
                          Tocá para activar el regalo →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Item activo
              const e = item;
              const days = daysUntil(e.birthday_date);
              const date = new Date(e.birthday_date);
              const dateStr = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
              const emoji = getEventEmoji(e.type, e.title);
              const totalGoal = parseFloat(e.goal_amount) || 0;
              const totalCollected = parseFloat(e.collected_amount) || 0;
              const pct = totalGoal > 0 ? Math.min(100, Math.round((totalCollected / totalGoal) * 100)) : 0;
              const participantCount = e.participant_count || e.participants?.length || 0;
              const contributorCount = e.contributor_count || 0;

              return (
                <Link key={'e-' + e.id} href={'/eventos/' + e.id} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ background: '#F5F3FF', padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '0.5px solid #EDE9FE' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '2px solid rgba(109,40,217,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                        {emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '500', fontSize: '16px', color: '#3B1FA8', margin: '0 0 2px', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#7C3AED', margin: 0 }}>
                          {participantCount > 0 ? `${participantCount} invitados · ` : ''}{contributorCount > 0 ? `${contributorCount} aportaron` : 'Sin aportes aún'}
                        </p>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '500', color: '#6D28D9', background: 'rgba(109,40,217,0.1)', padding: '4px 9px', borderRadius: '8px', whiteSpace: 'nowrap', alignSelf: 'flex-start', flexShrink: 0 }}>
                        {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : dateStr}
                      </div>
                    </div>
                    {totalGoal > 0 && (
                      <div style={{ padding: '12px 16px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                            {formatAmount(totalCollected)}
                          </span>
                          <span style={{ fontSize: '12px', color: '#999' }}>
                            meta {formatAmount(totalGoal)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{ flex: 1, height: '5px', background: '#EDE9FE', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: pct + '%', background: '#7C3AED', borderRadius: '99px' }} />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '500', color: '#7C3AED', whiteSpace: 'nowrap' }}>{pct}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {allItems.length > 6 && (
              <Link href="/eventos" style={{ display: 'block', textAlign: 'center', color: '#7C3AED', fontWeight: '500', fontSize: '14px', textDecoration: 'none', padding: '8px 0' }}>
                Ver todos ({allItems.length}) →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', padding: '10px 0 20px' }}>
        <Link href="/dashboard" style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: '500' }}>Inicio</span>
        </Link>
        <Link href="/circulos" style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></svg>
          <span style={{ fontSize: '10px', color: '#aaa', fontWeight: '500' }}>Círculos</span>
        </Link>
        <Link href="/perfil" style={{ flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span style={{ fontSize: '10px', color: '#aaa', fontWeight: '500' }}>Perfil</span>
        </Link>
      </div>

      {/* Bottom sheet — Crear regalo */}
      {showSheet && (
        <div onClick={() => setShowSheet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,10,60,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '0 0 40px' }}>
            <div style={{ width: '36px', height: '4px', background: '#E5E7EB', borderRadius: '99px', margin: '12px auto 0' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a', letterSpacing: '-0.02em', textAlign: 'center', padding: '16px 24px 4px' }}>
              ¿Cómo querés regalar?
            </h2>
            <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '0 24px 20px', lineHeight: '1.4', margin: 0 }}>
              Elegí el tipo de regalo y seguimos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px' }}>
              <Link href="/eventos/nuevo?tipo=grupal" style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: '16px', border: '1.5px solid #7C3AED', padding: '18px', display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#FAFAFF', cursor: 'pointer' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>👥</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontWeight: '500', fontSize: '16px', color: '#1a1a1a', margin: 0, letterSpacing: '-0.01em' }}>Regalo grupal</p>
                      <span style={{ fontSize: '10px', fontWeight: '500', color: '#6D28D9', background: '#EDE9FE', padding: '3px 8px', borderRadius: '6px' }}>Popular</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.4' }}>Invitá a otros, junten el dinero y sorprendan juntos.</p>
                  </div>
                </div>
              </Link>
              <Link href="/eventos/nuevo?tipo=individual" style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', padding: '18px', display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#fff', cursor: 'pointer' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🎁</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', fontSize: '16px', color: '#1a1a1a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Regalo individual</p>
                    <p style={{ fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.4' }}>Elegí una giftcard y enviála al instante.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {suggestedToActivate && (
        <ActivarRegaloSheet
          suggested={suggestedToActivate}
          onClose={() => setSuggestedToActivate(null)}
        />
      )}
    </div>
  );
}
