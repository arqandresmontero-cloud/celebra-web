'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

function daysUntil(dateStr) {
  const today = new Date();
  const date = new Date(dateStr);
  date.setFullYear(today.getFullYear());
  if (date < today) date.setFullYear(today.getFullYear() + 1);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

export default function EventoDetalle() {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [collection, setCollection] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    api.getEvents().then(events => {
      const ev = events.find(e => e.id === id);
      if (!ev) { router.replace('/dashboard'); return; }
      setEvent(ev);
      if (ev.collection_id) {
        api.getCollection(ev.collection_id).then(setCollection);
      }
    }).catch(() => { removeToken(); router.replace('/login'); })
    .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) return setError('Ingresá un monto válido');
    setPaying(true);
    setError('');
    try {
      const { checkout_url } = await api.checkout(event.collection_id, Number(amount));
      window.location.href = checkout_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Seguro que querés borrar este evento?')) return;
    setDeleting(true);
    try {
      await api.deleteEvent(id);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const shareWhatsApp = () => {
    const url = window.location.origin + '/gift/' + id;
    const text = 'Te invito a participar del regalo para ' + event.honoree_name + '! Entrá acá: ' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#888' }}>Cargando...</p></div>;
  if (!event) return null;

  const pct = event.target_amount ? Math.min(100, Math.round((event.collected || 0) / event.target_amount * 100)) : 0;
  const days = daysUntil(event.birthday_date);

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', color:'#fff' }}>
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'16px 24px', display:'flex', alignItems:'center', gap:'16px' }}>
        <Link href="/dashboard" style={{ color:'#888', textDecoration:'none', fontSize:'20px' }}>←</Link>
        <h1 style={{ fontSize:'18px', fontWeight:'700', flex:1 }}>{event.title}</h1>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'32px 24px' }}>
        {error && <div style={{ background:'#2a1a1a', border:'1px solid #ff4444', borderRadius:'8px', padding:'12px', marginBottom:'16px', color:'#ff6666', fontSize:'14px' }}>{error}</div>}

        <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'24px', marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
            <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#FFD70022', border:'2px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'700', color:'#FFD700' }}>
              {event.honoree_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <div>
              <p style={{ fontWeight:'700', fontSize:'18px' }}>{event.honoree_name}</p>
              <p style={{ color: days <= 7 ? '#FFD700':'#666', fontSize:'14px' }}>{days === 0 ? 'Hoy es su cumple' : 'Cumple en ' + days + ' dia' + (days!==1?'s':'')}</p>
            </div>
          </div>
          {event.target_amount && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ color:'#888', fontSize:'14px' }}>Recolectado</span>
                <span style={{ color:'#fff', fontWeight:'600' }}>${event.collected || 0} de ${event.target_amount}</span>
              </div>
              <div style={{ background:'#2a2a2a', borderRadius:'8px', height:'8px', overflow:'hidden' }}>
                <div style={{ width: pct + '%', background:'#FFD700', height:'100%', borderRadius:'8px' }} />
              </div>
              <p style={{ textAlign:'right', fontSize:'12px', color:'#555', marginTop:'4px' }}>{pct}%</p>
            </div>
          )}
        </div>

        {event.collection_id && (
          <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'24px', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'16px' }}>Hacer un aporte</h3>
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
              {[500, 1000, 2000, 5000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  style={{ flex:1, background: amount===String(v) ? '#FFD700':'#2a2a2a', color: amount===String(v) ? '#000':'#fff', border:'none', borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                  ${v}
                </button>
              ))}
            </div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="O ingresá otro monto"
              style={{ width:'100%', background:'#111', border:'1px solid #333', borderRadius:'8px', padding:'12px', color:'#fff', fontSize:'15px', boxSizing:'border-box', marginBottom:'12px' }} />
            <button onClick={handlePay} disabled={paying}
              style={{ width:'100%', background:'#FFD700', color:'#000', border:'none', borderRadius:'10px', padding:'14px', fontSize:'16px', fontWeight:'700', cursor: paying?'not-allowed':'pointer', opacity: paying?0.7:1 }}>
              {paying ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
            </button>
          </div>
        )}

        {collection?.contributions?.length > 0 && (
          <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'24px', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'16px' }}>Aportes ({collection.contributions.length})</h3>
            {collection.contributions.map((c, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #2a2a2a' }}>
                <span style={{ color:'#ccc' }}>{c.user_name}</span>
                <span style={{ color:'#FFD700', fontWeight:'600' }}>${c.amount}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <button onClick={shareWhatsApp}
            style={{ background:'#25D366', color:'#fff', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}>
            Invitar por WhatsApp
          </button>
          {event.collection_id && (
            <Link href={'/gift/' + id} target="_blank"
              style={{ display:'block', background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#fff', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'600', textAlign:'center', textDecoration:'none' }}>
              Ver pagina del destinatario
            </Link>
          )}
          <button onClick={handleDelete} disabled={deleting}
            style={{ background:'none', border:'1px solid #ff4444', color:'#ff6666', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'600', cursor: deleting?'not-allowed':'pointer', opacity: deleting?0.7:1 }}>
            {deleting ? 'Borrando...' : 'Borrar evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
