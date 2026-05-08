'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name:'', birthday:'' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.me()
      .then(u => { setUser(u); setForm({ name: u.name || '', birthday: u.birthday || '' }); })
      .catch(() => { removeToken(); router.replace('/login'); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await api.updateProfile(form);
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#888' }}>Cargando...</p></div>;

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', color:'#fff' }}>
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px' }}>
        <Link href="/dashboard" style={{ color:'#888', textDecoration:'none', fontSize:'20px' }}>←</Link>
        <h1 style={{ fontSize:'18px', fontWeight:'700' }}>Mi perfil</h1>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#FFD70022', border:'3px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:'28px', fontWeight:'700', color:'#FFD700' }}>
            {user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <p style={{ color:'#888', fontSize:'14px' }}>{user?.email}</p>
        </div>

        <form onSubmit={handleSave} style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'24px' }}>
          {error && <div style={{ background:'#2a1a1a', border:'1px solid #ff4444', borderRadius:'8px', padding:'12px', marginBottom:'16px', color:'#ff6666', fontSize:'14px' }}>{error}</div>}
          {saved && <div style={{ background:'#1a2a1a', border:'1px solid #44ff44', borderRadius:'8px', padding:'12px', marginBottom:'16px', color:'#66ff66', fontSize:'14px' }}>Perfil actualizado</div>}

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', color:'#888', fontSize:'14px', marginBottom:'6px' }}>Nombre</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              style={{ width:'100%', background:'#111', border:'1px solid #333', borderRadius:'8px', padding:'12px', color:'#fff', fontSize:'15px', boxSizing:'border-box' }} />
          </div>

          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', color:'#888', fontSize:'14px', marginBottom:'6px' }}>Fecha de cumpleaños</label>
            <input type="date" value={form.birthday} onChange={e => setForm({...form, birthday: e.target.value})}
              style={{ width:'100%', background:'#111', border:'1px solid #333', borderRadius:'8px', padding:'12px', color:'#fff', fontSize:'15px', boxSizing:'border-box' }} />
          </div>

          <button type="submit" disabled={saving}
            style={{ width:'100%', background:'#FFD700', color:'#000', border:'none', borderRadius:'10px', padding:'14px', fontSize:'16px', fontWeight:'700', cursor: saving?'not-allowed':'pointer', opacity: saving?0.7:1 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <button onClick={() => { removeToken(); router.push('/login'); }}
          style={{ width:'100%', marginTop:'16px', background:'none', border:'1px solid #333', borderRadius:'10px', padding:'14px', fontSize:'15px', color:'#888', cursor:'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
