'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

function daysUntil(dateStr) {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0,0,0,0);
  const date = new Date(dateStr);
  date.setFullYear(today.getFullYear());
  date.setHours(0,0,0,0);
  if (date < today) date.setFullYear(today.getFullYear() + 1);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const COLORS = ['#E9D5FF','#DDD6FE','#C4B5FD','#EDE9FE','#F3E8FF'];

export default function Eventos() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.getEvents()
      .then(e => setEvents([...e].sort((a,b) => daysUntil(a.birthday_date) - daysUntil(b.birthday_date))))
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}><p style={{ color:'#7C3AED' }}>Cargando...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'80px' }}>
      <div style={{ background:'#7C3AED', padding:'48px 24px 24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'800', color:'#fff', letterSpacing:'-1px', margin:0 }}>
          celebra<span style={{ color:'#FFA500' }}>.</span>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'14px', marginTop:'4px', marginBottom:0 }}>Todos tus eventos</p>
      </div>

      <div style={{ padding:'24px' }}>
        {events.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:'16px', padding:'48px', textAlign:'center' }}>
            <p style={{ fontSize:'32px', marginBottom:'12px' }}>🎁</p>
            <p style={{ color:'#999' }}>No tenés eventos activos.</p>
            <Link href="/eventos/nuevo" style={{ display:'inline-block', marginTop:'16px', background:'#7C3AED', color:'#fff', borderRadius:'12px', padding:'12px 24px', textDecoration:'none', fontWeight:'600' }}>Crear evento</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {events.map((e, i) => {
              const days = daysUntil(e.birthday_date);
              const date = new Date(e.birthday_date);
              const dateStr = date.toLocaleDateString('es-AR', { day:'numeric', month:'long' });
              const pct = e.target_amount ? Math.min(100, Math.round((e.collected || 0) / e.target_amount * 100)) : 0;
              return (
                <Link key={e.id} href={'/eventos/'+e.id} style={{ textDecoration:'none' }}>
                  <div style={{ background:'#fff', borderRadius:'16px', padding:'16px', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background: COLORS[i % COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'700', color:'#7C3AED', flexShrink:0 }}>
                      {initials(e.honoree_name)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:'600', fontSize:'15px', color:'#1a1a1a', margin:'0 0 2px' }}>{e.title}</p>
                      <p style={{ fontSize:'13px', color:'#7C3AED', margin:'0 0 6px' }}>{dateStr} · {e.type === 'group' ? 'grupal':'individual'}</p>
                      {e.target_amount && (
                        <div style={{ background:'#F0EEFF', borderRadius:'4px', height:'4px', overflow:'hidden' }}>
                          <div style={{ width: pct+'%', background:'#7C3AED', height:'100%', borderRadius:'4px' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ background:'#F0EEFF', borderRadius:'10px', padding:'6px 10px', fontSize:'13px', fontWeight:'600', color:'#7C3AED', flexShrink:0 }}>
                      {days === 0 ? 'Hoy' : days+'d'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #E9D5FF', display:'flex', alignItems:'center', justifyContent:'space-around', padding:'12px 0 20px' }}>
        <Link href="/dashboard" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>🏠</div><p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Inicio</p></Link>
        <Link href="/eventos" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>📅</div><p style={{ fontSize:'11px', color:'#7C3AED', fontWeight:'600', margin:'2px 0 0' }}>Eventos</p></Link>
        <Link href="/eventos/nuevo" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ width:'48px', height:'48px', background:'#7C3AED', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'-16px auto 0', fontSize:'24px', color:'#fff' }}>+</div></Link>
        <Link href="/amigos" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>🎂</div><p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Cumpleaños</p></Link>
        <Link href="/perfil" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>👤</div><p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Perfil</p></Link>
      </div>
    </div>
  );
}
