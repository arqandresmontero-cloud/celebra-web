'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', phone:'', birthday:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const { token } = tab === 'login'
        ? await api.login(form.email, form.password)
        : await api.register(form);
      setToken(token);
      const redirect = searchParams.get('redirect');
      const destination = redirect?.startsWith('/') && !redirect.startsWith('//')
        ? redirect
        : '/dashboard';
      router.replace(destination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#7C3AED', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ marginBottom:'40px', textAlign:'center' }}>
        <div style={{ width:'80px', height:'80px', background:'#fff', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', margin:'0 auto 20px' }}>🎁</div>
        <h1 style={{ fontSize:'36px', fontWeight:'800', color:'#fff', letterSpacing:'-1px', margin:0 }}>
          celebra<span style={{ color:'#FFA500' }}>.</span>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.7)', marginTop:'8px', fontSize:'16px' }}>regalos que unen</p>
      </div>

      <div style={{ width:'100%', maxWidth:'400px', background:'#fff', borderRadius:'24px', padding:'28px' }}>
        <div style={{ display:'flex', background:'#F0EEFF', borderRadius:'12px', padding:'4px', marginBottom:'24px' }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{ flex:1, padding:'10px', border:'none', borderRadius:'10px', fontWeight:'600', fontSize:'15px', cursor:'pointer', background: tab===t ? '#fff':'transparent', color: tab===t ? '#7C3AED':'#999', boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.1)':'' }}>
              {t === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {error && <div style={{ background:'#FFF0F0', border:'1px solid #ffcccc', borderRadius:'10px', padding:'12px', marginBottom:'16px', color:'#cc0000', fontSize:'14px' }}>{error}</div>}

        {tab === 'register' && (
          <>
            <div style={{ marginBottom:'14px' }}>
              <input type="text" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Tu nombre"
                style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
            </div>
            <div style={{ marginBottom:'14px' }}>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="Teléfono con código de país"
                style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
            </div>
            <div style={{ marginBottom:'14px' }}>
              <input type="date" value={form.birthday} onChange={e => setForm({...form, birthday:e.target.value})}
                aria-label="Fecha de cumpleaños"
                style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
            </div>
          </>
        )}

        <div style={{ marginBottom:'14px' }}>
          <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="Email"
            style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
        </div>

        <div style={{ marginBottom:'24px' }}>
          <input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="Contraseña"
            style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', background:'#7C3AED', color:'#fff', border:'none', borderRadius:'14px', padding:'16px', fontSize:'16px', fontWeight:'700', cursor: loading?'not-allowed':'pointer', opacity: loading?0.7:1 }}>
          {loading ? 'Cargando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </div>
    </div>
  );
}
