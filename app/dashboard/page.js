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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

const COLORS = ['#E9D5FF','#DDD6FE','#C4B5FD','#EDE9FE','#F3E8FF'];

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
    <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}>
      <p style={{ color:'#7C3AED' }}>Cargando...</p>
    </div>
  );

  const sorted = [...events].sort((a,b) => daysUntil(a.birthday_date) - daysUntil(b.birthday_date));

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'80px' }}>

      {/* Header violeta */}
      <div style={{ background:'#7C3AED', padding:'48px 24px 24px' }}>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'14px', marginBottom:'4px' }}>{greeting()}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h1 style={{ fontSize:'32px', fontWeight:'800', color:'#fff', letterSpacing:'-1px', margin:0 }}>
            celebra<span style={{ color:'#FFA500' }}>.</span>
          </h1>
          <button onClick={() => { removeToken(); router.push('/login'); }}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'8px 14px', color:'#fff', fontSize:'13px', cursor:'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding:'24px' }}>

        {/* Próximos eventos */}
        <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>Próximos eventos</p>

        {sorted.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:'16px', padding:'32px', textAlign:'center', marginBottom:'24px' }}>
            <p style={{ color:'#999' }}>No tenés eventos. Creá el primero.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
            {sorted.slice(0,3).map((e, i) => {
              const days = daysUntil(e.birthday_date);
              const date = new Date(e.birthday_date);
              const dateStr = date.toLocaleDateString('es-AR', { day:'numeric', month:'long' });
              return (
                <Link key={e.id} href={'/eventos/'+e.id} style={{ textDecoration:'none' }}>
                  <div style={{ background:'#fff', borderRadius:'16px', padding:'16px', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background: COLORS[i % COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'700', color:'#7C3AED', flexShrink:0 }}>
                      {initials(e.honoree_name)}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:'600', fontSize:'15px', color:'#1a1a1a', margin:'0 0 2px' }}>{e.title}</p>
                      <p style={{ fontSize:'13px', color:'#7C3AED', margin:0 }}>{dateStr} · {e.type === 'group' ? 'grupal' : 'individual'}</p>
                    </div>
                    <div style={{ background:'#F0EEFF', borderRadius:'10px', padding:'6px 10px', fontSize:'13px', fontWeight:'600', color:'#7C3AED' }}>
                      {days === 0 ? 'Hoy' : days+'d'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {sorted.length > 3 && (
          <Link href="/eventos" style={{ display:'block', textAlign:'center', color:'#7C3AED', fontWeight:'600', fontSize:'14px', marginBottom:'24px', textDecoration:'none' }}>
            Ver todos ({sorted.length}) →
          </Link>
        )}

        {/* Accesos rápidos */}
        <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px', marginTop:'8px' }}>Accesos rápidos</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
          <Link href="/eventos/nuevo" style={{ textDecoration:'none' }}>
            <div style={{ background:'#7C3AED', borderRadius:'16px', padding:'20px 12px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ fontSize:'24px', marginBottom:'8px' }}>＋</div>
              <p style={{ color:'#fff', fontSize:'13px', fontWeight:'600', margin:0 }}>Nuevo evento</p>
            </div>
          </Link>
          <Link href="/amigos" style={{ textDecoration:'none' }}>
            <div style={{ background:'#fff', borderRadius:'16px', padding:'20px 12px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ fontSize:'24px', marginBottom:'8px' }}>🎂</div>
              <p style={{ color:'#7C3AED', fontSize:'13px', fontWeight:'600', margin:0 }}>Cumpleaños</p>
            </div>
          </Link>
          <Link href="/perfil" style={{ textDecoration:'none' }}>
            <div style={{ background:'#fff', borderRadius:'16px', padding:'20px 12px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ fontSize:'24px', marginBottom:'8px' }}>👤</div>
              <p style={{ color:'#7C3AED', fontSize:'13px', fontWeight:'600', margin:0 }}>Perfil</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #E9D5FF', display:'flex', alignItems:'center', justifyContent:'space-around', padding:'12px 0 20px' }}>
        <Link href="/dashboard" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ fontSize:'22px' }}>🏠</div>
          <p style={{ fontSize:'11px', color:'#7C3AED', fontWeight:'600', margin:'2px 0 0' }}>Inicio</p>
        </Link>
        <Link href="/eventos" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ fontSize:'22px' }}>📅</div>
          <p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Eventos</p>
        </Link>
        <Link href="/eventos/nuevo" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ width:'48px', height:'48px', background:'#7C3AED', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'-16px auto 0', fontSize:'24px', color:'#fff' }}>+</div>
        </Link>
        <Link href="/amigos" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ fontSize:'22px' }}>🎂</div>
          <p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Cumpleaños</p>
        </Link>
        <Link href="/perfil" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ fontSize:'22px' }}>👤</div>
          <p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Perfil</p>
        </Link>
      </div>
    </div>
  );
}
