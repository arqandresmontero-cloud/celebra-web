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
    setSaving(true); setError(''); setSaved(false);
    try {
      const updated = await api.updateProfile(form);
      setUser(updated); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}><p style={{ color:'#7C3AED' }}>Cargando...</p></div>;

  const ini = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'80px' }}>
      <div style={{ background:'#7C3AED', padding:'48px 24px 40px', textAlign:'center' }}>
        <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'3px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:'24px', fontWeight:'700', color:'#fff' }}>
          {ini}
        </div>
        <p style={{ color:'#fff', fontWeight:'700', fontSize:'18px', margin:'0 0 4px' }}>{user?.name}</p>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px', margin:0 }}>{user?.email}</p>
      </div>

      <div style={{ padding:'24px' }}>
        <form onSubmit={handleSave}>
          {error && <div style={{ background:'#FFF0F0', border:'1px solid #ffcccc', borderRadius:'12px', padding:'12px', marginBottom:'16px', color:'#cc0000', fontSize:'14px' }}>{error}</div>}
          {saved && <div style={{ background:'#F0FFF0', border:'1px solid #ccffcc', borderRadius:'12px', padding:'12px', marginBottom:'16px', color:'#007700', fontSize:'14px' }}>Perfil actualizado ✓</div>}

          <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'16px' }}>
            <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'16px', marginTop:0 }}>Mis datos</p>

            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', color:'#999', fontSize:'13px', marginBottom:'6px' }}>Nombre</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'13px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
            </div>

            <div>
              <label style={{ display:'block', color:'#999', fontSize:'13px', marginBottom:'6px' }}>Fecha de cumpleaños</label>
              <input type="text" value={form.birthday} onChange={e => setForm({...form, birthday:e.target.value})}
                placeholder="YYYY-MM-DD"
                style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'13px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ width:'100%', background:'#7C3AED', color:'#fff', border:'none', borderRadius:'14px', padding:'16px', fontSize:'16px', fontWeight:'700', cursor: saving?'not-allowed':'pointer', opacity: saving?0.7:1, marginBottom:'12px' }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <button onClick={() => { removeToken(); router.push('/login'); }}
          style={{ width:'100%', background:'#fff', border:'1px solid #E9D5FF', borderRadius:'14px', padding:'16px', fontSize:'15px', color:'#7C3AED', fontWeight:'600', cursor:'pointer' }}>
          Cerrar sesión
        </button>
      </div>

      <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #E9D5FF', display:'flex', alignItems:'center', justifyContent:'space-around', padding:'12px 0 20px' }}>
        <Link href="/dashboard" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ fontSize:'22px' }}>🏠</div>
          <p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Inicio</p>
        </Link>
        <Link href="/circulos" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ fontSize:'22px' }}>👥</div>
          <p style={{ fontSize:'11px', color:'#999', margin:'2px 0 0' }}>Círculos</p>
        </Link>
        <Link href="/perfil" style={{ textDecoration:'none', textAlign:'center' }}>
          <div style={{ fontSize:'22px' }}>👤</div>
          <p style={{ fontSize:'11px', color:'#7C3AED', fontWeight:'600', margin:'2px 0 0' }}>Perfil</p>
        </Link>
      </nav>
    </div>
  );
}
