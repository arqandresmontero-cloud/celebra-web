'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

function formatAmount(n) {
  if (!n) return '$0';
  return '$' + Number(n).toLocaleString('es-AR');
}

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

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}>
      <p style={{ color:'#7C3AED' }}>Cargando...</p>
    </div>
  );

  if (error && !data) return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif' }}>
      <p style={{ color:'#ef4444' }}>{error}</p>
    </div>
  );

  const { event, contributions, providers } = data;
  const collected = parseFloat(event.collected) || 0;
  const target = parseFloat(event.target_amount) || 0;
  const pct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

  if (step === 'done' && result) return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ maxWidth:'420px', width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
        <h2 style={{ fontSize:'26px', fontWeight:'700', color:'#3B1FA8', marginBottom:'8px', letterSpacing:'-0.03em' }}>¡Regalo canjeado!</h2>
        {result.method === 'giftcard' ? (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'28px', marginTop:'24px', border:'0.5px solid rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', marginBottom:'16px', fontSize:'15px' }}>Tu giftcard de <strong style={{ color:'#3B1FA8' }}>{result.provider}</strong></p>
            <div style={{ background:'#F0EEFF', border:'2px dashed #7C3AED', borderRadius:'14px', padding:'20px', marginBottom:'16px' }}>
              <p style={{ color:'#999', fontSize:'12px', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.07em' }}>Tu código</p>
              <p style={{ color:'#6B3FD4', fontSize:'24px', fontWeight:'800', letterSpacing:'3px', margin:0 }}>{result.code}</p>
            </div>
            <p style={{ color:'#888', fontSize:'14px' }}>Monto: <strong>{formatAmount(result.amount)}</strong></p>
          </div>
        ) : (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'28px', marginTop:'24px', border:'0.5px solid rgba(0,0,0,0.06)' }}>
            <p style={{ color:'#888', marginBottom:'12px', fontSize:'15px' }}>Transferencia en camino a tu cuenta</p>
            <p style={{ color:'#3B1FA8', fontSize:'32px', fontWeight:'700', letterSpacing:'-0.03em', margin:'0 0 8px' }}>{formatAmount(result.amount)}</p>
            <p style={{ color:'#bbb', fontSize:'13px' }}>Comisión Celebra: {formatAmount(result.fee)}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', fontFamily:'system-ui, sans-serif', paddingBottom:'40px' }}>

      {/* Header */}
      <div style={{ background:'#6B3FD4', padding:'48px 24px 40px', textAlign:'center' }}>
        <h1 style={{ fontSize:'28px', fontWeight:'700', color:'#fff', letterSpacing:'-1.5px', margin:'0 0 32px' }}>
          celebra<span style={{ color:'#F97316' }}>.</span>
        </h1>
        <div style={{ fontSize:'56px', marginBottom:'12px' }}>🎁</div>
        <h2 style={{ fontSize:'22px', fontWeight:'700', color:'#fff', margin:'0 0 6px', letterSpacing:'-0.02em' }}>
          ¡Tus amigos te regalaron!
        </h2>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'15px', margin:0 }}>
          {event.honoree_name}, este regalo es para vos
        </p>
      </div>

      <div style={{ maxWidth:'500px', margin:'0 auto', padding:'24px 16px' }}>

        {/* Monto recolectado */}
        <div style={{ background:'#fff', borderRadius:'20px', padding:'24px', marginBottom:'16px', border:'0.5px solid rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize:'11px', fontWeight:'500', color:'#888', letterSpacing:'0.07em', textTransform:'uppercase', margin:'0 0 16px' }}>Lo que juntaron</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'12px' }}>
            <span style={{ fontSize:'36px', fontWeight:'700', color:'#3B1FA8', letterSpacing:'-0.03em' }}>{formatAmount(collected)}</span>
            {target > 0 && <span style={{ fontSize:'13px', color:'#bbb' }}>meta {formatAmount(target)}</span>}
          </div>
          {target > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ flex:1, height:'6px', background:'#EDE9FE', borderRadius:'99px', overflow:'hidden' }}>
                <div style={{ height:'100%', width: pct+'%', background:'#7C3AED', borderRadius:'99px' }} />
              </div>
              <span style={{ fontSize:'12px', fontWeight:'600', color:'#7C3AED' }}>{pct}%</span>
            </div>
          )}
        </div>

        {/* Participantes */}
        {contributions.length > 0 && (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'24px', marginBottom:'16px', border:'0.5px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize:'11px', fontWeight:'500', color:'#888', letterSpacing:'0.07em', textTransform:'uppercase', margin:'0 0 16px' }}>
              Quiénes participaron ({contributions.length})
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {contributions.map((c, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#6B3FD4' }}>
                      {(c.user_name || '?').slice(0,2).toUpperCase()}
                    </div>
                    <span style={{ fontSize:'15px', color:'#1a1a1a', fontWeight:'500' }}>{c.user_name}</span>
                  </div>
                  <span style={{ fontSize:'14px', color:'#7C3AED', fontWeight:'600' }}>{formatAmount(c.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA o formulario canje */}
        {step === 'info' && (
          <button onClick={() => setStep('redeem')}
            style={{ width:'100%', background:'#6B3FD4', color:'#fff', border:'none', borderRadius:'14px', padding:'18px', fontSize:'17px', fontWeight:'600', cursor:'pointer', letterSpacing:'-0.01em' }}>
            Canjear mi regalo 🎉
          </button>
        )}

        {step === 'redeem' && (
          <div style={{ background:'#fff', borderRadius:'20px', padding:'24px', border:'0.5px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize:'16px', fontWeight:'600', color:'#1a1a1a', margin:'0 0 20px', letterSpacing:'-0.01em' }}>¿Cómo querés recibirlo?</p>

            {error && <div style={{ background:'#FFF0F0', border:'1px solid #ffcccc', borderRadius:'12px', padding:'12px', marginBottom:'16px', color:'#cc0000', fontSize:'14px' }}>{error}</div>}

            <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
              <button onClick={() => { setMethod('giftcard'); setTransferInfo(''); }}
                style={{ flex:1, background: method==='giftcard' ? '#6B3FD4' : '#F0EEFF', color: method==='giftcard' ? '#fff' : '#6B3FD4', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}>
                🎁 Giftcard
              </button>
              <button onClick={() => { setMethod('transfer'); setProviderId(''); }}
                style={{ flex:1, background: method==='transfer' ? '#6B3FD4' : '#F0EEFF', color: method==='transfer' ? '#fff' : '#6B3FD4', border:'none', borderRadius:'12px', padding:'14px', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}>
                💸 Transferencia
              </button>
            </div>

            {method === 'giftcard' && providers && providers.length > 0 && (
              <div style={{ marginBottom:'20px' }}>
                <p style={{ color:'#999', fontSize:'13px', marginBottom:'10px' }}>Elegí la giftcard:</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {providers.map(p => (
                    <button key={p.id} onClick={() => setProviderId(p.id)}
                      style={{ background: providerId===p.id ? '#F0EEFF':'#fafafa', border: providerId===p.id ? '2px solid #7C3AED':'1px solid #eee', borderRadius:'12px', padding:'14px 16px', color:'#1a1a1a', fontSize:'15px', fontWeight:'500', cursor:'pointer', textAlign:'left' }}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'giftcard' && (!providers || providers.length === 0) && (
              <div style={{ background:'#F0EEFF', borderRadius:'12px', padding:'16px', marginBottom:'20px', textAlign:'center' }}>
                <p style={{ color:'#7C3AED', fontSize:'14px', margin:0 }}>🎁 Giftcards disponibles próximamente</p>
              </div>
            )}

            {method === 'transfer' && (
              <div style={{ marginBottom:'20px' }}>
                <label style={{ display:'block', color:'#999', fontSize:'13px', marginBottom:'6px' }}>Tu CBU o alias</label>
                <input type="text" value={transferInfo} onChange={e => setTransferInfo(e.target.value)} placeholder="Ej: mi.alias.mp"
                  style={{ width:'100%', background:'#F0EEFF', border:'none', borderRadius:'12px', padding:'13px', fontSize:'15px', color:'#1a1a1a', boxSizing:'border-box', outline:'none' }} />
                <p style={{ color:'#bbb', fontSize:'12px', marginTop:'6px' }}>Se descuenta un 2% de comisión de plataforma.</p>
              </div>
            )}

            {method && (
              <button onClick={handleRedeem} disabled={redeeming}
                style={{ width:'100%', background: redeeming ? '#ccc' : '#6B3FD4', color:'#fff', border:'none', borderRadius:'14px', padding:'16px', fontSize:'16px', fontWeight:'600', cursor: redeeming?'not-allowed':'pointer' }}>
                {redeeming ? 'Procesando...' : 'Confirmar canje'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
