'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function GiftPage() {
  const { eventId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('info');
  const [method, setMethod] = useState('');
  const [providerId, setProviderId] = useState('');
  const [transferInfo, setTransferInfo] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    api.getGift(eventId)
      .then(setData)
      .catch(() => setError('No se encontró el regalo.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleRedeem = async () => {
    if (!method) return setError('Elegí un método');
    if (method === 'giftcard' && !providerId) return setError('Elegí una giftcard');
    if (method === 'transfer' && !transferInfo) return setError('Ingresá tu CBU/alias');
    setRedeeming(true);
    setError('');
    try {
      const res = await api.redeemGift(eventId, { method, provider_id: providerId, transfer_info: transferInfo });
      setResult(res);
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#888' }}>Cargando...</p></div>;
  if (error && !data) return <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center' }}><p style={{ color:'#ff6666' }}>{error}</p></div>;

  const { event, contributions, providers } = data;
  const pct = event.target_amount ? Math.min(100, Math.round((event.collected || 0) / event.target_amount * 100)) : 0;

  if (step === 'done' && result) return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ maxWidth:'400px', width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'20px', padding:'40px', textAlign:'center' }}>
        <p style={{ fontSize:'48px', marginBottom:'16px' }}>🎉</p>
        <h2 style={{ fontSize:'22px', fontWeight:'700', color:'#fff', marginBottom:'8px' }}>Regalo canjeado</h2>
        {result.method === 'giftcard' ? (
          <>
            <p style={{ color:'#888', marginBottom:'24px' }}>Tu giftcard de {result.provider}</p>
            <div style={{ background:'#111', border:'2px dashed #FFD700', borderRadius:'12px', padding:'20px', marginBottom:'24px' }}>
              <p style={{ color:'#888', fontSize:'12px', marginBottom:'8px' }}>Tu codigo</p>
              <p style={{ color:'#FFD700', fontSize:'22px', fontWeight:'800', letterSpacing:'2px' }}>{result.code}</p>
            </div>
            <p style={{ color:'#888', fontSize:'14px' }}>Monto: ${result.amount}</p>
          </>
        ) : (
          <>
            <p style={{ color:'#888', marginBottom:'16px' }}>Transferencia en camino</p>
            <p style={{ color:'#fff', fontSize:'18px', fontWeight:'700' }}>${result.amount}</p>
            <p style={{ color:'#555', fontSize:'13px', marginTop:'8px' }}>Comision Celebra: ${result.fee}</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', color:'#fff' }}>
      <div style={{ background:'#1a1a1a', borderBottom:'1px solid #2a2a2a', padding:'16px 24px', textAlign:'center' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'800', letterSpacing:'-1px' }}>
          celebra<span style={{ color:'#FFD700' }}>.</span>
        </h1>
      </div>

      <div style={{ maxWidth:'500px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <p style={{ fontSize:'48px', marginBottom:'12px' }}>🎁</p>
          <h2 style={{ fontSize:'24px', fontWeight:'700', marginBottom:'8px' }}>Tus amigos te regalaron</h2>
          <p style={{ color:'#888' }}>un regalo grupal, {event.honoree_name}</p>
        </div>

        <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'24px', marginBottom:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
            <span style={{ color:'#888' }}>Total recolectado</span>
            <span style={{ color:'#FFD700', fontWeight:'700', fontSize:'20px' }}>${event.collected || 0}</span>
          </div>
          {event.target_amount && (
            <>
              <div style={{ background:'#2a2a2a', borderRadius:'8px', height:'8px', overflow:'hidden', marginBottom:'8px' }}>
                <div style={{ width: pct + '%', background:'#FFD700', height:'100%', borderRadius:'8px' }} />
              </div>
              <p style={{ color:'#555', fontSize:'13px' }}>{pct}% de la meta de ${event.target_amount}</p>
            </>
          )}
          {contributions.length > 0 && (
            <div style={{ marginTop:'16px', borderTop:'1px solid #2a2a2a', paddingTop:'16px' }}>
              <p style={{ color:'#888', fontSize:'13px', marginBottom:'10px' }}>Aportaron:</p>
              {contributions.map((c, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ color:'#ccc', fontSize:'14px' }}>{c.user_name}</span>
                  <span style={{ color:'#FFD700', fontSize:'14px' }}>${c.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {step === 'info' && (
          <button onClick={() => setStep('redeem')}
            style={{ width:'100%', background:'#FFD700', color:'#000', border:'none', borderRadius:'12px', padding:'16px', fontSize:'16px', fontWeight:'700', cursor:'pointer' }}>
            Canjear mi regalo
          </button>
        )}

        {step === 'redeem' && (
          <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'16px', padding:'24px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'600', marginBottom:'20px' }}>Como queres recibirlo?</h3>
            {error && <div style={{ background:'#2a1a1a', border:'1px solid #ff4444', borderRadius:'8px', padding:'12px', marginBottom:'16px', color:'#ff6666', fontSize:'14px' }}>{error}</div>}

            <div style={{ display:'flex', gap:'12px', marginBottom:'20px' }}>
              <button onClick={() => { setMethod('giftcard'); setTransferInfo(''); }}
                style={{ flex:1, background: method==='giftcard' ? '#FFD700':'#2a2a2a', color: method==='giftcard' ? '#000':'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>
                Giftcard
              </button>
              <button onClick={() => { setMethod('transfer'); setProviderId(''); }}
                style={{ flex:1, background: method==='transfer' ? '#FFD700':'#2a2a2a', color: method==='transfer' ? '#000':'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>
                Transferencia
              </button>
            </div>

            {method === 'giftcard' && providers.length > 0 && (
              <div style={{ marginBottom:'20px' }}>
                <p style={{ color:'#888', fontSize:'14px', marginBottom:'10px' }}>Elegí la giftcard:</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {providers.map(p => (
                    <button key={p.id} onClick={() => setProviderId(p.id)}
                      style={{ background: providerId===p.id ? '#FFD70022':'#111', border: providerId===p.id ? '2px solid #FFD700':'1px solid #333', borderRadius:'10px', padding:'12px 16px', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'pointer', textAlign:'left' }}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'transfer' && (
              <div style={{ marginBottom:'20px' }}>
                <label style={{ display:'block', color:'#888', fontSize:'14px', marginBottom:'6px' }}>Tu CBU o alias</label>
                <input type="text" value={transferInfo} onChange={e => setTransferInfo(e.target.value)} placeholder="Ej: mi.alias.mp"
                  style={{ width:'100%', background:'#111', border:'1px solid #333', borderRadius:'8px', padding:'12px', color:'#fff', fontSize:'15px', boxSizing:'border-box' }} />
                <p style={{ color:'#555', fontSize:'12px', marginTop:'6px' }}>Se descuenta un 2% de comision de plataforma.</p>
              </div>
            )}

            <button onClick={handleRedeem} disabled={redeeming}
              style={{ width:'100%', background:'#FFD700', color:'#000', border:'none', borderRadius:'12px', padding:'16px', fontSize:'16px', fontWeight:'700', cursor: redeeming?'not-allowed':'pointer', opacity: redeeming?0.7:1 }}>
              {redeeming ? 'Procesando...' : 'Confirmar canje'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
