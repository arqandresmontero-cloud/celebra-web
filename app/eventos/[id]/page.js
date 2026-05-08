'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
      if (ev.collection_id) api.getCollection(ev.collection_id).then(setCollection);
    }).catch(() => { removeToken(); router.replace('/login'); })
    .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) return setError('Ingresá un monto válido');
    setPaying(true); setError('');
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
    if (!confirm('¿Seguro que querés borrar este evento?')) return;
    setDeleting(true);
    try {
      await api.deleteEvent(id);
      router.push('/eventos');
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

  if (loading) return <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}><p style={{ color:'#7C3AED' }}>Cargando...</p></div>;
  if (!event) return null;

  const pct = event.target_amount ? Math.min(100, Math.round((event.collected || 0) / event.target_amount * 100)) : 0;
  const days = daysUntil(event.birthday_date);
  const ini = event.honoree_name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const dateStr = new Date(event.birthday_date).toLocaleDateString('es-AR', { day:'numeric', month:'long' });

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'40px' }}>
      <div style={{ background:'#7C3AED', padding:'48px 24px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' }}>
          <Link href="/eventos" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'22px' }}>←</Link>
          <h1 style={{ fontSize:'20px', fontWeight:'700', color:'#fff', margin:0 }}>{event.title}</h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'700', color:'#fff' }}>
            {ini}
          </div>
          <div>
            <p style={{ color:'#fff', fontWeight:'700', fontSize:'18px', margin:'0 0 4px' }}>{event.honoree_name}</p>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'14px', margin:0 }}>{dateStr} · {days === 0 ? 'Hoy' : 'en '+days+' día'+(days!==1?'s':'')}</p>
          </div>
        </div>
      </div>

      <div style={{ padding:'24px' }}>
        {error && <div style={{ background:'#FFF0F0', border:'1px solid #ffcccc', borderRadius:'12px', padding:'12px', marginBottom:'16px', color:'#cc0000', fontSize:'14px' }}>{error}</div>}

        {event.target_amount && (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
              <span style={{ color:'#999', fontSize:'14px' }}>Recolectado</span>
              <span style={{ color:'#7C3AED', fontWeight:'700', fontSize:'16px' }}>${event.collected || 0} de ${event.target_amount}</span>
            </div>
            <div style={{ background:'#F0EEFF', borderRadius:'8px', height:'8px', overflow:'hidden', marginBottom:'6px' }}>
              <div style={{ width:pct+'%', background:'#7C3AED', height:'100%', borderRadius:'8px' }} />
            </div>
            <p style={{ textAlign:'right', fontSize:'12px', color:'#999', margin:0 }}>{pct}%</p>
          </div>
        )}

        {event.collection_id && (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'16px' }}>
            <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'16px', marginTop:0 }}>Hacer un aporte</p>
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
              {[500,1000,2000,5000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  style={{ flex:1, background: amount===String(v) ? '#7C3AED':'#F0EEFF', color: amount===String(v) ? '#fff':'#7C3AED', border:'none', borderRadius:'10px', padding:'10px 0', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
                  ${v}
                </button>
              ))}
            </div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Otro monto"
              style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'13px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none', marginBottom:'12px' }} />
            <button onClick={handlePay} disabled={paying}
              style={{ width:'100%', background:'#7C3AED', color:'#fff', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'700', cursor: paying?'not-allowed':'pointer', opacity: paying?0.7:1 }}>
              {paying ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
            </button>
          </div>
        )}

        {collection?.contributions?.length > 0 && (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', marginBottom:'16px' }}>
            <p style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'16px', marginTop:0 }}>Aportes ({collection.contributions.length})</p>
            {collection.contributions.map((c,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: i < collection.contributions.length-1 ? '1px solid #F0EEFF':'' }}>
                <span style={{ color:'#1a1a1a', fontSize:'14px' }}>{c.user_name}</span>
                <span style={{ color:'#7C3AED', fontWeight:'600', fontSize:'14px' }}>${c.amount}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <button onClick={shareWhatsApp}
            style={{ background:'#25D366', color:'#fff', border:'none', borderRadius:'14px', padding:'14px', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}>
            Invitar por WhatsApp
          </button>
          {event.collection_id && (
            <Link href={'/gift/'+id} target="_blank"
              style={{ display:'block', background:'#fff', border:'1px solid #E9D5FF', color:'#7C3AED', borderRadius:'14px', padding:'14px', fontSize:'15px', fontWeight:'600', textAlign:'center', textDecoration:'none' }}>
              Ver página del destinatario
            </Link>
          )}
          <button onClick={handleDelete} disabled={deleting}
            style={{ background:'#fff', border:'1px solid #ffcccc', color:'#cc0000', borderRadius:'14px', padding:'14px', fontSize:'15px', fontWeight:'600', cursor: deleting?'not-allowed':'pointer', opacity: deleting?0.7:1 }}>
            {deleting ? 'Borrando...' : 'Borrar evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
