'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

const money = value => '$' + Number(value || 0).toLocaleString('es-AR');

const statusLabel = {
  requested: 'Solicitada',
  processing: 'En preparación',
  fulfilled: 'Emitida',
  failed: 'Fallida',
  cancelled: 'Cancelada',
};

export default function GiftPage() {
  return <Suspense fallback={<Shell><p style={{ color:'#7C3AED' }}>Cargando regalo...</p></Shell>}><GiftPageContent /></Suspense>;
}

function GiftPageContent() {
  const { eventId } = useParams();
  const searchParams = useSearchParams();
  const redemptionToken = searchParams.get('token') || '';
  const [data, setData] = useState(null);
  const [providerId, setProviderId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadGift = async () => {
    try {
      setData(await api.getGift(eventId, redemptionToken));
    } catch (err) {
      setError(err.message || 'No se encontró el regalo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getGift(eventId, redemptionToken)
      .then(setData)
      .catch(err => setError(err.message || 'No se encontró el regalo.'))
      .finally(() => setLoading(false));
  }, [eventId, redemptionToken]);

  const requestGiftcard = async () => {
    const value = Number(amount);
    if (!providerId) return setError('Elegí una gift card.');
    if (!Number.isFinite(value) || value <= 0) return setError('Ingresá un monto válido.');
    if (value > Number(data.available_balance)) return setError('El monto supera tu saldo disponible.');
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const result = await api.redeemGift(eventId, { provider_id: providerId, amount: value, redemption_token: redemptionToken });
      setNotice(result.message);
      setAmount('');
      setProviderId('');
      await loadGift();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const contribute = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setError('Ingresá un monto válido.');
    setSubmitting(true);
    setError('');
    try {
      const result = await api.checkout(data.event.collection_id, value);
      window.location.href = result.checkout_url;
    } catch (err) {
      setError(err.message === 'Token requerido' ? 'Ingresá a Celebra para realizar tu aporte.' : err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <Shell><p style={{ color:'#7C3AED' }}>Cargando regalo...</p></Shell>;
  if (!data) return <Shell><p style={{ color:'#dc2626' }}>{error}</p></Shell>;

  const { event, contributions, providers, redemptions = [] } = data;
  const collected = Number(event.collected || 0);
  const available = Number(data.available_balance || 0);
  const used = collected - available;

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'40px' }}>
      <header style={{ background:'#6B3FD4', padding:'48px 24px 36px', textAlign:'center' }}>
        <h1 style={{ fontSize:'28px', color:'#fff', margin:'0 0 24px' }}>celebra<span style={{ color:'#F97316' }}>.</span></h1>
        <div style={{ fontSize:'52px' }}>🎁</div>
        <h2 style={{ color:'#fff', fontSize:'22px', margin:'10px 0 6px' }}>{data.can_redeem ? 'Tu regalo grupal' : 'Regalo grupal para ' + event.honoree_name}</h2>
        <p style={{ color:'rgba(255,255,255,.75)', margin:0 }}>{data.can_redeem ? event.honoree_name + ', elegí cómo usar tu saldo' : 'Sumate con el monto que quieras'}</p>
      </header>

      <main style={{ maxWidth:'520px', margin:'0 auto', padding:'20px 16px' }}>
        <section style={card}>
          <p style={eyebrow}>Saldo disponible</p>
          <p style={{ color:'#3B1FA8', fontSize:'38px', fontWeight:800, margin:'0 0 6px' }}>{money(available)}</p>
          <p style={{ color:'#888', fontSize:'13px', margin:0 }}>
            Reunido: {money(collected)}{used > 0 ? ' · Canjeado o reservado: ' + money(used) : ''}
          </p>
        </section>

        {error && <div style={errorBox}>{error}</div>}
        {notice && <div style={noticeBox}>{notice}</div>}

        {data.can_redeem && available > 0 ? (
          <section style={card}>
            <p style={{ fontSize:'18px', fontWeight:700, margin:'0 0 6px' }}>Elegí una gift card</p>
            <p style={{ color:'#888', fontSize:'14px', margin:'0 0 18px' }}>Podés hacer varios canjes hasta agotar tu saldo. Usar Celebra no reduce el valor de tu regalo.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:'8px', marginBottom:'18px' }}>
              {providers.map(provider => (
                <button key={provider.id} onClick={() => setProviderId(provider.id)}
                  style={{ padding:'13px 10px', borderRadius:'12px', border:providerId===provider.id?'2px solid #6B3FD4':'1px solid #E5E7EB', background:providerId===provider.id?'#F0EEFF':'#fff', color:'#30205f', fontWeight:600, cursor:'pointer' }}>
                  {provider.logo_url && <span>{provider.logo_url} </span>}{provider.name}
                </button>
              ))}
            </div>
            <label style={{ display:'block', color:'#777', fontSize:'13px', marginBottom:'6px' }}>Monto a canjear</label>
            <input type="number" min="1" max={available} value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={'Hasta ' + money(available)}
              style={{ width:'100%', boxSizing:'border-box', padding:'14px', border:'1px solid #DDD6FE', background:'#FAFAFF', borderRadius:'12px', fontSize:'16px', marginBottom:'12px' }} />
            <button onClick={requestGiftcard} disabled={submitting || !providerId || !amount}
              style={{ width:'100%', padding:'15px', border:0, borderRadius:'13px', background:submitting?'#bbb':'#6B3FD4', color:'#fff', fontSize:'16px', fontWeight:700, cursor:submitting?'wait':'pointer' }}>
              {submitting ? 'Registrando...' : 'Solicitar gift card'}
            </button>
            <p style={{ color:'#999', fontSize:'12px', lineHeight:1.45, margin:'12px 0 0' }}>El comercio absorbe la comisión de Celebra. La solicitud queda reservada hasta que el comercio confirme la emisión.</p>
          </section>
        ) : data.can_redeem ? (
          <section style={{ ...card, textAlign:'center' }}>
            <div style={{ fontSize:'36px' }}>✨</div>
            <p style={{ fontWeight:700 }}>No queda saldo disponible</p>
            <p style={{ color:'#888', fontSize:'14px' }}>Podés consultar abajo el estado de tus gift cards.</p>
          </section>
        ) : (
          <section style={card}>
            <p style={{ fontSize:'18px', fontWeight:700, margin:'0 0 6px' }}>Hacé tu aporte</p>
            <p style={{ color:'#888', fontSize:'14px', margin:'0 0 16px' }}>El destinatario podrá convertir el saldo reunido en una o varias gift cards.</p>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Monto"
              style={{ width:'100%', boxSizing:'border-box', padding:'14px', border:'1px solid #DDD6FE', background:'#FAFAFF', borderRadius:'12px', fontSize:'16px', marginBottom:'12px' }} />
            <button onClick={contribute} disabled={submitting || !amount}
              style={{ width:'100%', padding:'15px', border:0, borderRadius:'13px', background:submitting?'#bbb':'#6B3FD4', color:'#fff', fontSize:'16px', fontWeight:700 }}>
              {submitting ? 'Redirigiendo...' : 'Aportar con Mercado Pago'}
            </button>
          </section>
        )}

        {redemptions.length > 0 && (
          <section style={card}>
            <p style={eyebrow}>Mis gift cards</p>
            {redemptions.map(item => (
              <div key={item.id} style={{ borderTop:'1px solid #F0EEFF', padding:'14px 0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:'12px' }}>
                  <strong>{item.logo_url} {item.provider}</strong>
                  <strong style={{ color:'#6B3FD4' }}>{money(item.amount)}</strong>
                </div>
                <p style={{ color:'#888', fontSize:'13px', margin:'6px 0 0' }}>
                  {statusLabel[item.status] || item.status}
                </p>
                {item.code && <p style={{ background:'#F0EEFF', padding:'10px', borderRadius:'9px', fontWeight:800, letterSpacing:'2px' }}>{item.code}</p>}
              </div>
            ))}
          </section>
        )}

        {contributions.length > 0 && (
          <section style={card}>
            <p style={eyebrow}>Participaron</p>
            <p style={{ color:'#666', margin:0 }}>{contributions.map(c => c.user_name).join(', ')}</p>
          </section>
        )}
      </main>
    </div>
  );
}

function Shell({ children }) {
  return <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}>{children}</div>;
}

const card = { background:'#fff', borderRadius:'20px', padding:'22px', marginBottom:'14px', border:'1px solid rgba(59,31,168,.07)' };
const eyebrow = { color:'#888', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 12px' };
const errorBox = { background:'#FFF0F0', border:'1px solid #fecaca', color:'#b91c1c', padding:'12px', borderRadius:'12px', marginBottom:'14px' };
const noticeBox = { background:'#ECFDF5', border:'1px solid #a7f3d0', color:'#047857', padding:'12px', borderRadius:'12px', marginBottom:'14px' };
