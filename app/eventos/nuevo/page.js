'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';

export default function NuevoEvento() {
  const router = useRouter();
  const [form, setForm] = useState({ honoree_name:'', birthday_date:'', title:'', type:'group', target_amount:'', honoree_phone:'', honoree_email:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!getToken()) { router.replace('/login'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form, target_amount: form.target_amount ? Number(form.target_amount) : undefined };
      const event = await api.createEvent(payload);
      router.push('/eventos/'+event.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type='text', placeholder='') => (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ display:'block', color:'#999', fontSize:'13px', marginBottom:'6px' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({...form, [key]:e.target.value})} placeholder={placeholder}
        style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'13px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'40px' }}>
      <div style={{ background:'#7C3AED', padding:'48px 24px 24px', display:'flex', alignItems:'center', gap:'16px' }}>
        <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'22px' }}>←</Link>
        <h1 style={{ fontSize:'20px', fontWeight:'700', color:'#fff', margin:0 }}>Nuevo evento</h1>
      </div>

      <div style={{ padding:'24px' }}>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background:'#FFF0F0', border:'1px solid #ffcccc', borderRadius:'12px', padding:'12px', marginBottom:'16px', color:'#cc0000', fontSize:'14px' }}>{error}</div>}

          <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'16px' }}>
            <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'16px', marginTop:0 }}>Datos del evento</p>
            {field('Nombre del homenajeado *', 'honoree_name', 'text', 'Ej: María')}
            {field('Fecha del cumpleaños *', 'birthday_date', 'date')}
            {field('Título del evento', 'title', 'text', 'Ej: Cumple de María')}
            <div style={{ marginBottom:'14px' }}>
              <label style={{ display:'block', color:'#999', fontSize:'13px', marginBottom:'6px' }}>Tipo de evento</label>
              <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'13px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }}>
                <option value="group">Grupal</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            {field('Meta de recolección ($)', 'target_amount', 'number', 'Ej: 5000')}
          </div>

          <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'24px' }}>
            <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'16px', marginTop:0 }}>Datos del homenajeado</p>
            {field('Teléfono', 'honoree_phone', 'tel', 'Ej: +54911...')}
            {field('Email', 'honoree_email', 'email', 'Ej: maria@email.com')}
          </div>

          <button type="submit" disabled={loading}
            style={{ width:'100%', background:'#7C3AED', color:'#fff', border:'none', borderRadius:'14px', padding:'16px', fontSize:'16px', fontWeight:'700', cursor: loading?'not-allowed':'pointer', opacity: loading?0.7:1 }}>
            {loading ? 'Creando...' : 'Crear evento'}
          </button>
        </form>
      </div>
    </div>
  );
}
