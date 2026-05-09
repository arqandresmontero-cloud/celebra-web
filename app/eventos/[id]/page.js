'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, getToken, removeToken } from '@/lib/api';

function parseDateStr(dateStr) {
  if (!dateStr) return null;
  // Soporta "2026-05-15", "2026-05-15T00:00:00.000Z", etc.
  const str = dateStr.split('T')[0];
  const parts = str.split('-').map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1], day: parts[2] };
}

function daysUntil(dateStr) {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(today.getFullYear(), parsed.month - 1, parsed.day);
  if (date < today) date.setFullYear(today.getFullYear() + 1);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return '';
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return parsed.day + ' de ' + months[parsed.month - 1];
}

function formatAmount(n) {
  if (!n) return '$0';
  return '$' + Number(n).toLocaleString('es-AR');
}

function getEmoji(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('casamiento') || t.includes('boda')) return '💍';
  if (t.includes('baby') || t.includes('bebé')) return '🍼';
  if (t.includes('graduaci')) return '🎓';
  if (t.includes('aniversario')) return '🥂';
  return '🎂';
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
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const shareWhatsApp = () => {
    const url = window.location.origin + '/gift/' + id;
    const text = '¡Estamos juntando para regalarle algo a ' + event.honoree_name + '! Aportá acá 🎁: ' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#7C3AED' }}>Cargando...</p>
    </div>
  );
  if (!event) return null;

  const collected = event.collected || 0;
  const suggested = event.target_amount || 0;
  const contributorCount = collection?.contributions?.length || 0;
  const days = daysUntil(event.birthday_date);
  const dateStr = formatDate(event.birthday_date);
  const emoji = getEmoji(event.title);

  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' }}>

      <div style={{ background: '#6B3FD4', padding: '52px 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '22px', lineHeight: 1 }}>←</Link>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{event.title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
            {emoji}
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: '500', fontSize: '18px', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{event.honoree_name}</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: 0 }}>
              {dateStr} · {days === 0 ? '¡Hoy!' : 'en ' + days + ' día' + (days !== 1 ? 's' : '')}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: '12px', padding: '12px', color: '#cc0000', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px', marginTop: 0 }}>
            Sumar participantes
          </p>
          <p style={{ fontSize: '14px', color: '#555', margin: '0 0 14px', lineHeight: '1.4' }}>
            Compartí el link para que cada uno aporte a su ritmo, sin que tengas que cobrar vos.
          </p>
          <button onClick={shareWhatsApp}
            style={{ width: '100%', background: '#25D366', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📲</span> Invitar por WhatsApp
          </button>
          {event.collection_id && (
            <Link href={'/gift/' + id} target="_blank"
              style={{ display: 'block', textAlign: 'center', color: '#7C3AED', fontSize: '13px', fontWeight: '500', marginTop: '10px', textDecoration: 'none' }}>
              Ver link del regalo →
            </Link>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px', marginTop: 0 }}>
            Lo juntado
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <span style={{ fontSize: '28px', fontWeight: '500', color: '#1a1a1a', letterSpacing: '-0.02em' }}>{formatAmount(collected)}</span>
            <span style={{ fontSize: '13px', color: '#aaa' }}>{contributorCount} aporte{contributorCount !== 1 ? 's' : ''}</span>
          </div>
          {suggested > 0 && (
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 10px' }}>
              Aporte sugerido: <strong style={{ color: '#6B3FD4' }}>{formatAmount(suggested)} por persona</strong>
            </p>
          )}
          <div style={{ background: '#F0EEFF', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: suggested > 0 ? Math.min(100, Math.round(collected / suggested * 100)) + '%' : '0%', background: '#7C3AED', height: '100%', borderRadius: '8px' }} />
          </div>
        </div>

        {collection?.contributions?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px', marginTop: 0 }}>
              Aportes ({collection.contributions.length})
            </p>
            {collection.contributions.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < collection.contributions.length - 1 ? '1px solid #F5F3FF' : '' }}>
                <span style={{ color: '#1a1a1a', fontSize: '14px' }}>{c.user_name}</span>
                <span style={{ color: '#7C3AED', fontWeight: '500', fontSize: '14px' }}>{formatAmount(c.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {event.collection_id && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px', marginTop: 0 }}>
              Hacer un aporte
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[500, 1000, 2000, 5000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  style={{ flex: 1, background: amount === String(v) ? '#7C3AED' : '#F0EEFF', color: amount === String(v) ? '#fff' : '#7C3AED', border: 'none', borderRadius: '10px', padding: '10px 0', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  ${v}
                </button>
              ))}
            </div>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Otro monto"
              style={{ width: '100%', background: '#F0EEFF', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '15px', color: '#1a1a1a', boxSizing: 'border-box', outline: 'none', marginBottom: '12px' }} />
            <button onClick={handlePay} disabled={paying}
              style={{ width: '100%', background: '#6B3FD4', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '500', cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1 }}>
              {paying ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
            </button>
          </div>
        )}

        <button onClick={handleDelete} disabled={deleting}
          style={{ background: 'transparent', border: 'none', color: '#ccc', fontSize: '13px', cursor: deleting ? 'not-allowed' : 'pointer', padding: '8px', textAlign: 'center' }}>
          {deleting ? 'Borrando...' : 'Borrar evento'}
        </button>

      </div>
    </div>
  );
}
