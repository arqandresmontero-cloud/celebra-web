'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
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
    try {
      const res = await api.searchFriends(q);
      setResults(res);
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = async (id) => {
    await api.follow(id);
    setResults(prev => prev.map(u => u.id === id ? { ...u, following: true } : u));
    const followed = results.find(u => u.id === id);
    if (followed) setFriends(prev => [...prev, { ...followed, following: true }]);
  };

  const handleUnfollow = async (id) => {
    await api.unfollow(id);
    setFriends(prev => prev.filter(u => u.id !== id));
    setResults(prev => prev.map(u => u.id === id ? { ...u, following: false } : u));
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#888' }}>Cargando...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', color:'#fff' }}>
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px' }}>
        <Link href="/dashboard" style={{ color:'#888', textDecoration:'none', fontSize:'20px' }}>←</Link>
        <h1 style={{ fontSize:'18px', fontWeight:'700' }}>Amigos</h1>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:'24px' }}>
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            style={{ width:'100%', background:'#1a1a1a', border:'1px solid #333', borderRadius:'10px', padding:'14px', color:'#fff', fontSize:'15px', boxSizing:'border-box' }}
          />
        </div>

        {query.length >= 2 && (
          <div style={{ marginBottom:'32px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:'600', color:'#888', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Resultados</h3>
            {searching && <p style={{ color:'#666', fontSize:'14px' }}>Buscando...</p>}
            {!searching && results.length === 0 && <p style={{ color:'#666', fontSize:'14px' }}>No se encontraron usuarios.</p>}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {results.map(u => (
                <div key={u.id} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#FFD70022', border:'2px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color:'#FFD700', flexShrink:0 }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'600', fontSize:'15px' }}>{u.name}</p>
                    {u.birthday && <p style={{ color:'#666', fontSize:'13px' }}>🎂 {new Date(u.birthday).toLocaleDateString('es-AR', { day:'numeric', month:'long' })}</p>}
                  </div>
                  <button
                    onClick={() => u.following ? handleUnfollow(u.id) : handleFollow(u.id)}
                    style={{ background: u.following ? '#2a2a2a':'#FFD700', color: u.following ? '#888':'#000', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                    {u.following ? 'Siguiendo' : 'Seguir'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 style={{ fontSize:'14px', fontWeight:'600', color:'#888', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Tus amigos ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <div style={{ background:'#1a1a1a', border:'1px dashed #2a2a2a', borderRadius:'16px', padding:'40px', textAlign:'center' }}>
              <p style={{ fontSize:'28px', marginBottom:'12px' }}>👥</p>
              <p style={{ color:'#666' }}>Todavia no seguís a nadie. Buscalos arriba.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {friends.map(u => (
                <div key={u.id} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#FFD70022', border:'2px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color:'#FFD700', flexShrink:0 }}>
                    {initials(u.name)}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:'600', fontSize:'15px' }}>{u.name}</p>
                    {u.birthday && <p style={{ color:'#666', fontSize:'13px' }}>🎂 {new Date(u.birthday).toLocaleDateString('es-AR', { day:'numeric', month:'long' })}</p>}
                  </div>
                  <button
                    onClick={() => handleUnfollow(u.id)}
                    style={{ background:'#2a2a2a', color:'#888', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                    Siguiendo
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
