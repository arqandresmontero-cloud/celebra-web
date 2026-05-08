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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    Promise.all([api.me(), api.getEvents(), api.getBirthdays()])
      .then(([u, e, b]) => { setUser(u); setEvents(e); setBirthdays(b); })
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#888' }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', color:'#fff' }}>
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'800', letterSpacing:'-1px' }}>
          celebra<span style={{ color:'#FFD700' }}>.</span>
        </h1>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <Link href="/amigos" style={{ color:'#888', textDecoration:'none', fontSize:'14px' }}>Amigos</Link>
          <Link href="/perfil" style={{ color:'#888', textDecoration:'none', fontSize:'14px' }}>Perfil</Link>
          <button onClick={() => { removeToken(); router.push('/login'); }} style={{ background:'none', border:'1px solid #333', borderRadius:'8px', padding:'6px 12px', color:'#888', cursor:'pointer', fontSize:'13px' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:'32px' }}>
          <h2 style={{ fontSize:'24px', fontWeight:'700', marginBottom:'4px' }}>Hola, {user?.name?.split(' ')[0]} 👋</h2>
          <p style={{ color:'#666', fontSize:'15px' }}>{events.length === 0 ? 'No tenés eventos. Creá el primero.' : 'Tenés ' + events.length + ' evento' + (events.length !== 1 ? 's' : '') + ' activo' + (events.length !== 1 ? 's' : '')}</p>
        </div>

        <Link href="/eventos/nuevo" style={{ display:'block', background:'#FFD700', color:'#000', borderRadius:'12px', padding:'16px 24px', textDecoration:'none', fontWeight:'700', fontSize:'16px', textAlign:'center', marginBottom:'32px' }}>
          + Crear nuevo evento
        </Link>

        {birthdays.length > 0 && (
          <div style={{ marginBottom:'32px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'600', color:'#888', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Próximos cumpleaños</h3>
            <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px' }}>
              {birthdays.slice(0, 5).map(b => {
                const days = daysUntil(b.birthday);
                return (
                  <div key={b.id} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'16px', minWidth:'120px', textAlign:'center', flexShrink:0 }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'#FFD70022', border:'2px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:'16px', fontWeight:'700', color:'#FFD700' }}>
                      {initials(b.name)}
                    </div>
                    <p style={{ fontSize:'13px', fontWeight:'600', marginBottom:'4px' }}>{b.name.split(' ')[0]}</p>
                    <p style={{ fontSize:'12px', color:'#FFD700' }}>{days === 0 ? 'Hoy 🎂' : 'en ' + days + 'd'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h3 style={{ fontSize:'16px', fontWeight:'600', color:'#888', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Tus eventos</h3>
          {events.length === 0 ? (
            <div style={{ background:'#1a1a1a', border:'1px dashed #2a2a2a', borderRadius:'16px', padding:'48px', textAlign:'center' }}>
              <p style={{ fontSize:'32px', marginBottom:'12px' }}>🎁</p>
              <p style={{ color:'#666' }}>No tenés eventos activos.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {events.map(e => {
                const days = daysUntil(e.birthday_date);
                const pct = e.target_amount ? Math.min(100, Math.round((e.collected || 0) / e.target_amount * 100)) : 0;
                return (
                  <Link key={e.id} href={'/eventos/' + e.id} style={{ textDecoration:'none' }}>
                    <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'20px', display:'flex', alignItems:'center', gap:'16px', cursor:'pointer' }}>
                      <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'#FFD70022', border:'2px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', color:'#FFD700', flexShrink:0 }}>
                        {initials(e.honoree_name)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:'600', fontSize:'16px', color:'#fff', marginBottom:'4px' }}>{e.title}</p>
                        <p style={{ fontSize:'13px', color: days <= 7 ? '#FFD700':'#666' }}>{days === 0 ? 'Hoy 🎂' : 'en ' + days + ' dia' + (days !== 1 ? 's' : '')}</p>
                        {e.target_amount && (
                          <div style={{ marginTop:'8px' }}>
                            <div style={{ background:'#2a2a2a', borderRadius:'4px', height:'4px', overflow:'hidden' }}>
                              <div style={{ width: pct + '%', background:'#FFD700', height:'100%', borderRadius:'4px' }} />
                            </div>
                            <p style={{ fontSize:'11px', color:'#555', marginTop:'4px' }}>${e.collected || 0} de ${e.target_amount}</p>
                          </div>
                        )}
                      </div>
                      <span style={{ color:'#444', fontSize:'20px' }}>›</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
