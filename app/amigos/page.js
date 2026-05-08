'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

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

export default function Amigos() {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.getFriends()
      .then(setFriends)
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try { setResults(await api.searchFriends(q)); }
    finally { setSearching(false); }
  };

  const handleFollow = async (id) => {
    await api.follow(id);
    const u = results.find(u => u.id === id);
    setResults(prev => prev.map(u => u.id === id ? {...u, following:true} : u));
    if (u) setFriends(prev => [...prev, {...u, following:true}]);
  };

  const handleUnfollow = async (id) => {
    await api.unfollow(id);
    setFriends(prev => prev.filter(u => u.id !== id));
    setResults(prev => prev.map(u => u.id === id ? {...u, following:false} : u));
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}><p style={{ color:'#7C3AED' }}>Cargando...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'80px' }}>
      <div style={{ background:'#7C3AED', padding:'48px 24px 24px' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'800', color:'#fff', letterSpacing:'-1px', margin:0 }}>
          celebra<span style={{ color:'#FFA500' }}>.</span>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'14px', marginTop:'4px', marginBottom:0 }}>Cumpleaños de amigos</p>
      </div>

      <div style={{ padding:'24px' }}>
        <input type="text" value={query} onChange={e => handleSearch(e.target.value)} placeholder="Buscar amigos..."
          style={{ width:'100%', background:'#fff', border:'none', borderRadius:'14px', padding:'14px 16px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none', marginBottom:'20px', boxShadow:'0 1px 4px rgba(124,58,237,0.08)' }} />

        {query.length >= 2 && (
          <div style={{ marginBottom:'24px' }}>
            <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>Resultados</p>
            {searching && <p style={{ color:'#999', fontSize:'14px' }}>Buscando...</p>}
            {!searching && results.length === 0 && <p style={{ color:'#999', fontSize:'14px' }}>No se encontraron usuarios.</p>}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {results.map(u => (
                <div key={u.id} style={{ background:'#fff', borderRadius:'16px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#E9D5FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color:'#7C3AED', flexShrink:0 }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'600', fontSize:'15px', color:'#1a1a1a', margin:'0 0 2px' }}>{u.name}</p>
                    {u.birthday && <p style={{ color:'#7C3AED', fontSize:'13px', margin:0 }}>{new Date(u.birthday).toLocaleDateString('es-AR', { day:'numeric', month:'long' })}</p>}
                  </div>
                  <button onClick={() => u.following ? handleUnfollow(u.id) : handleFollow(u.id)}
                    style={{ background: u.following ? '#F0EEFF':'#7C3AED', color: u.following ? '#7C3AED':'#fff', border:'none', borderRadius:'10px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                    {u.following ? 'Siguiendo' : 'Seguir'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>
          Tus amigos ({friends.length})
        </p>
        {friends.length === 0 ? (
          <div style={{ background:'#fff', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
            <p style={{ fontSize:'28px', marginBottom:'8px' }}>👥</p>
            <p style={{ color:'#999', fontSize:'14px' }}>Todavía no seguís a nadie.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {friends.map(u => {
              const days = daysUntil(u.birthday);
              return (
                <div key={u.id} style={{ background:'#fff', borderRadius:'16px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#E9D5FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color:'#7C3AED', flexShrink:0 }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'600', fontSize:'15px', color:'#1a1a1a', margin:'0 0 2px' }}>{u.name}</p>
                    {u.birthday && <p style={{ color:'#7C3AED', fontSize:'13px', margin:0 }}>{new Date(u.birthday).toLocaleDateString('es-AR', { day:'numeric', month:'long' })}</p>}
                  </div>
                  <div style={{ background:'#F0EEFF', borderRadius:'10px', padding:'6px 10px', fontSize:'13px', fontWeight:'600', color:'#7C3AED' }}>
                    {days === 0 ? 'Hoy' : days+'d'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #E9D5FF', display:'flex', alignItems:'center', justifyContent:'space-around', padding:'12px 0 20px' }}>
        <Link href="/dashboard" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>🏠</div><p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Inicio</p></Link>
        <Link href="/eventos" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>📅</div><p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Eventos</p></Link>
        <Link href="/eventos/nuevo" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ width:'48px', height:'48px', background:'#7C3AED', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'-16px auto 0', fontSize:'24px', color:'#fff' }}>+</div></Link>
        <Link href="/amigos" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>🎂</div><p style={{ fontSize:'11px', color:'#7C3AED', fontWeight:'600', margin:'2px 0 0' }}>Cumpleaños</p></Link>
        <Link href="/perfil" style={{ textDecoration:'none', textAlign:'center' }}><div style={{ fontSize:'22px' }}>👤</div><p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Perfil</p></Link>
      </div>
    </div>
  );
}
