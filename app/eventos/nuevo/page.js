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
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, target_amount: form.target_amount ? Number(form.target_amount) : undefined };
      const event = await api.createEvent(payload);
      router.push(`/eventos/${event.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const input = (label, key, type='text', placeholder='') => (
    <div style={{ marginBottom:'16px' }}>
      <label style={{ display:'block', color:'#888', fontSize:'14px', marginBottom:'6px' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={placeholder}
        style={{ width:'100%', background:'#111', border:'1px solid #333', borderRadius:'8px', padding:'12px', color:'#fff', fontSize:'15px', boxSizing:'border-box' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', color:'#fff' }}>
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px' }}>
        <Link href="/dashboard" style={{ color:'#888', textDecoration:'none', fontSize:'20px' }}>←</Link>
        <h1 style={{ fontSize:'18px', fontWeight:'700' }}>Nuevo evento</h1>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'32px 24px' }}>
        <form onSubmit={handleSubmit} style={{ background:'#1a1a1a', borderRadius:'16px', padding:'32px', border:'1px solid #2a2a2a' }}>
          {error && <div style={{ background:'#2a1a1a', border:'1px solid #ff4444', borderRadius:'8px', padding:'12px', marginBottom:'16px', color:'#ff6666', fontSize:'14px' }}>{error}</div>}

          {input('Nombre del homenajeado *', 'honoree_name', 'text', 'Ej: María')}
          {input('Fecha del cumpleaños *', 'birthday_date', 'date')}
          {input('Título del evento', 'title', 'text', 'Ej: Cumple de María')}

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', color:'#888', fontSize:'14px', marginBottom:'6px' }}>Tipo de evento</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              style={{ width:'100%', background:'#111', border:'1px solid #333', borderRadius:'8px', padding:'12px', color:'#fff', fontSize:'15px', boxSizing:'border-box' }}>
              <option value="group">Grupal</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          {input('Meta de recolección ($)', 'target_amount', 'number', 'Ej: 5000')}
          {input('Teléfono del homenajeado', 'honoree_phone', 'tel', 'Ej: +54911...')}
          {input('Email del homenajeado', 'honoree_email', 'email', 'Ej: maria@email.com')}

          <button type="submit" disabled={loading}
            style={{ width:'100%', background:'#FFD700', color:'#000', border:'none', borderRadius:'10px', padding:'14px', fontSize:'16px', fontWeight:'700', cursor: loading ? 'not-allowed':'pointer', opacity: loading ? 0.7:1, marginTop:'8px' }}>
            {loading ? 'Creando...' : 'Crear evento'}
          </button>
        </form>
      </div>
    </div>
  );
}
