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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [suggestedToActivate, setSuggestedToActivate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    Promise.all([api.me(), api.getEvents(), api.getSuggestedEvents(), api.getNotifications()])
      .then(([u, e, s, n]) => { setUser(u); setEvents(e); setSuggested(s); setNotifications(n); })
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#7C3AED', fontSize: '15px' }}>Cargando...</p>
    </div>
  );

  // Solo eventos grupales, ordenados por fecha, máximo 3
  const groupEvents = [...events]
    .filter(e => e.type !== 'solo')
    .sort((a, b) => daysUntil(a.birthday_date) - daysUntil(b.birthday_date))
    .slice(0, 3);

  const allItems = [
    ...groupEvents.map(e => ({ ...e, _type: 'active' })),
    ...suggested.map(s => ({ ...s, _type: 'suggested' })),
  ].sort((a, b) => daysUntil(a.birthday_date || a.event_date) - daysUntil(b.birthday_date || b.event_date));

  const totalGroupEvents = events.filter(e => e.type !== 'solo').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: '#6B3FD4', padding: '52px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#fff', letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>
            celebra<span style={{ color: '#F97316' }}>.</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button aria-label="Ver notificaciones" onClick={() => setShowNotifications(v => !v)} style={{ position:'relative', width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', cursor:'pointer', fontSize:'16px' }}>
              🔔
              {notifications.some(n => !n.read) && <span style={{ position:'absolute', top:'1px', right:'1px', width:'8px', height:'8px', borderRadius:'50%', background:'#F97316', border:'1px solid #6B3FD4' }} />}
            </button>
            <Link href="/perfil" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              {user ? (user.name || user.email || '').slice(0, 2).toUpperCase() : 'AN'}
            </Link>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '14px', margin: 0, letterSpacing: '-0.01em' }}>
          Regalar, por fin simple.
        </p>
      </div>

      <div style={{ padding: '16px' }}>

        {showNotifications && (
          <div style={{ background:'#fff', borderRadius:'16px', padding:'14px', marginBottom:'16px', boxShadow:'0 8px 24px rgba(59,31,168,0.12)' }}>
            <p style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:'600', color:'#3B1FA8' }}>Notificaciones</p>
            {notifications.length === 0 ? (
              <p style={{ margin:0, fontSize:'13px', color:'#999' }}>Todavía no tenés notificaciones.</p>
            ) : notifications.slice(0, 8).map(n => {
              const item = (
                <div style={{ padding:'10px 0', borderTop:'1px solid #F1EEFF' }}>
                  <p style={{ margin:'0 0 3px', fontSize:'13px', fontWeight:'600', color:'#26213A' }}>{n.title}</p>
                  <p style={{ margin:0, fontSize:'12px', lineHeight:'1.4', color:'#777' }}>{n.body}</p>
                </div>
              );
              return n.data?.circle_id
                ? <Link key={n.id} href={'/circulos/' + n.data.circle_id} style={{ textDecoration:'none' }}>{item}</Link>
                : <div key={n.id}>{item}</div>;
            })}
          </div>
        )}

        {/* Dos botones principales */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <Link href="/eventos/nuevo?tipo=grupal" style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1.5px solid #EDE9FE', cursor: 'pointer' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👥</div>
              <p style={{ fontWeight: '600', fontSize: '14px', color: '#3B1FA8', margin: 0, textAlign: 'center', letterSpacing: '-0.01em' }}>Regalo grupal</p>
              <p style={{ fontSize: '11px', color: '#999', margin: 0, textAlign: 'center', lineHeight: '1.3' }}>Junten entre todos</p>
            </div>
          </Link>
          <Link href="/eventos/nuevo?tipo=individual" style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1.5px solid #FFF4ED', cursor: 'pointer' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🎁</div>
              <p style={{ fontWeight: '600', fontSize: '14px', color: '#92400e', margin: 0, textAlign: 'center', letterSpacing: '-0.01em' }}>Regalo individual</p>
              <p style={{ fontSize: '11px', color: '#999', margin: 0, textAlign: 'center', lineHeight: '1.3' }}>Elegí una gift card</p>
            </div>
          </Link>
        </div>

        {/* Regalos grupales activos + sugeridos */}
        {allItems.length > 0 && (
          <>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Próximos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allItems.map((item) => {
                if (item._type === 'suggested') {
                  const days = daysUntil(item.event_date);
                  const date = new Date(item.event_date);
                  const dateStr = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
                  return (
                    <div key={'s-' + item.id} onClick={() => setSuggestedToActivate(item)} style={{ cursor: 'pointer' }}>
                      <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px dashed #F97316', overflow: 'hidden' }}>
                        <div style={{ background: '#FFF4ED', padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '2px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🎂</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: '500', fontSize: '16px', color: '#92400e', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                            <p style={{ fontSize: '12px', color: '#F97316', margin: 0 }}>Sugerido · Tocá para activar</p>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: '500', color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '4px 9px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : dateStr}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const e = item;
                const days = daysUntil(e.birthday_date);
                const date = new Date(e.birthday_date);
                const dateStr = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
                const emoji = getEventEmoji(e.type, e.title);
                const collected = parseFloat(e.collected) || 0;
                const target = parseFloat(e.target_amount) || 0;
                const pct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

                return (
                  <Link key={'e-' + e.id} href={'/eventos/' + e.id} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                      <div style={{ background: '#F5F3FF', padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '0.5px solid #EDE9FE' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '2px solid rgba(109,40,217,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: '500', fontSize: '16px', color: '#3B1FA8', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
                          <p style={{ fontSize: '12px', color: '#7C3AED', margin: 0 }}>
                            {e.contributor_count > 0 ? `${e.contributor_count} aportaron` : 'Sin aportes aún'}
                          </p>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: '#6D28D9', background: 'rgba(109,40,217,0.1)', padding: '4px 9px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : dateStr}
                        </div>
                      </div>
                      {target > 0 && (
                        <div style={{ padding: '12px 16px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                            <span style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a1a', letterSpacing: '-0.02em' }}>{formatAmount(collected)}</span>
                            <span style={{ fontSize: '12px', color: '#999' }}>meta {formatAmount(target)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <div style={{ flex: 1, height: '5px', background: '#EDE9FE', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: pct + '%', background: '#7C3AED', borderRadius: '99px' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#7C3AED' }}>{pct}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}

              {totalGroupEvents > 3 && (
                <Link href="/eventos" style={{ display: 'block', textAlign: 'center', color: '#7C3AED', fontWeight: '500', fontSize: '14px', textDecoration: 'none', padding: '8px 0' }}>
                  Ver todos ({totalGroupEvents}) →
                </Link>
              )}
            </div>
          </>
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

      {suggestedToActivate && (
        <ActivarRegaloSheet
          suggested={suggestedToActivate}
          onClose={() => setSuggestedToActivate(null)}
        />
      )}
    </div>
  );
}
