'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, getToken } from '@/lib/api';

const TITULOS = [
  { value: 'Cumpleaños', label: '🎂 Cumpleaños' },
  { value: 'Casamiento', label: '💍 Casamiento' },
  { value: 'Aniversario', label: '🥂 Aniversario' },
  { value: 'Baby shower', label: '🍼 Baby shower' },
  { value: 'Graduación', label: '🎓 Graduación' },
  { value: 'Otro', label: '✏️ Otro (escribir)' },
];

const inputStyle = {
  width: '100%', background: '#F0EEFF', border: 'none',
  borderRadius: '12px', padding: '13px', fontSize: '15px',
  color: '#1a1a1a', boxSizing: 'border-box', outline: 'none',
};
const labelStyle = { display: 'block', color: '#999', fontSize: '13px', marginBottom: '6px' };
const fieldWrap = { marginBottom: '14px' };

export default function NuevoEventoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#7C3AED' }}>Cargando...</p></div>}>
      <NuevoEvento />
    </Suspense>
  );
}

function NuevoEvento() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get('tipo') || 'group';
  const tipo = tipoParam === 'individual' ? 'individual' : 'group';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    honoree_name: '',
    birthday_date: '',
    tituloOpcion: '',
    tituloCustom: '',
    target_amount: '',
    honoree_phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [individualAmount, setIndividualAmount] = useState('');

  if (!getToken()) { router.replace('/login'); return null; }

  const tituloFinal = form.tituloOpcion === 'Otro' ? form.tituloCustom : form.tituloOpcion;

  const handleNext = () => {
    setError('');
    if (tipo === 'group') {
      if (!form.honoree_name || !form.birthday_date || !tituloFinal) {
        setError('Completá nombre, fecha y tipo de celebración.');
        return;
      }
    } else {
      if (!form.honoree_name) {
        setError('Completá el nombre del destinatario.');
        return;
      }
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        honoree_name: form.honoree_name,
        birthday_date: form.birthday_date || new Date().toISOString().split('T')[0],
        title: tituloFinal ? tituloFinal + ' de ' + form.honoree_name : 'Regalo de ' + form.honoree_name,
        type: tipo,
        target_amount: tipo === 'individual' ? (individualAmount ? Number(individualAmount) : undefined) : (form.target_amount ? Number(form.target_amount) : undefined),
        honoree_phone: form.honoree_phone || undefined,
      };
      const event = await api.createEvent(payload);
      router.push('/eventos/' + event.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const header = (
    <div style={{ background: '#6B3FD4', padding: '52px 20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <button onClick={() => step === 1 ? router.back() : setStep(1)}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '22px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>←</button>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          {tipo === 'group' ? 'Regalo grupal' : 'Regalo individual'}
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0' }}>
          Paso {step} de 2
        </p>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1,2].map(s => (
          <div key={s} style={{
            width: s === step ? 20 : 8, height: 8,
            borderRadius: 4,
            background: s === step ? '#fff' : 'rgba(255,255,255,0.3)',
            transition: 'width 0.2s'
          }} />
        ))}
      </div>
    </div>
  );

  // FLUJO GRUPAL
  if (tipo === 'group') {
    if (step === 1) return (
      <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' }}>
        {header}
        <div style={{ padding: '16px' }}>
          {error && <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>{error}</div>}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px', marginTop: 0 }}>La celebración</p>
            <div style={fieldWrap}>
              <label style={labelStyle}>Nombre del homenajeado *</label>
              <input type="text" value={form.honoree_name} onChange={e => setForm({ ...form, honoree_name: e.target.value })} placeholder="Ej: María" style={inputStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Fecha *</label>
              <input type="date" value={form.birthday_date} onChange={e => setForm({ ...form, birthday_date: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>¿Qué se celebra? *</label>
              <select value={form.tituloOpcion} onChange={e => setForm({ ...form, tituloOpcion: e.target.value, tituloCustom: '' })}
                style={{ ...inputStyle, color: form.tituloOpcion ? '#1a1a1a' : '#aaa' }}>
                <option value="" disabled>Seleccioná una opción</option>
                {TITULOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {form.tituloOpcion === 'Otro' && (
              <div style={{ ...fieldWrap, marginTop: '14px' }}>
                <label style={labelStyle}>¿Cuál? *</label>
                <input type="text" value={form.tituloCustom} onChange={e => setForm({ ...form, tituloCustom: e.target.value })} placeholder="Ej: Despedida de soltera" style={inputStyle} autoFocus />
              </div>
            )}
          </div>
          <button onClick={handleNext} style={{ width: '100%', background: '#6B3FD4', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', letterSpacing: '-0.01em' }}>
            Siguiente →
          </button>
        </div>
      </div>
    );

    return (
      <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' }}>
        {header}
        <div style={{ padding: '16px' }}>
          {error && <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>{error}</div>}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px', marginTop: 0 }}>El aporte</p>
            <div style={fieldWrap}>
              <label style={labelStyle}>Aporte sugerido por persona ($)</label>
              <input type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} placeholder="Ej: 5000" style={inputStyle} />
              <p style={{ fontSize: '12px', color: '#bbb', margin: '6px 0 0' }}>Opcional. Lo que le pedirías a cada invitado.</p>
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Teléfono del homenajeado (WhatsApp)</label>
              <input type="tel" value={form.honoree_phone} onChange={e => setForm({ ...form, honoree_phone: e.target.value })} placeholder="Ej: +5491112345678" style={inputStyle} />
              <p style={{ fontSize: '12px', color: '#bbb', margin: '6px 0 0' }}>Opcional. Le avisamos cuando el regalo esté listo.</p>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', background: '#6B3FD4', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '-0.01em' }}>
            {loading ? 'Creando...' : '🎁 Crear regalo'}
          </button>
        </div>
      </div>
    );
  }

  // FLUJO INDIVIDUAL
  if (step === 1) return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' }}>
      {header}
      <div style={{ padding: '16px' }}>
        {error && <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>{error}</div>}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px', marginTop: 0 }}>¿A quién le regalás?</p>
          <div style={fieldWrap}>
            <label style={labelStyle}>Nombre *</label>
            <input type="text" value={form.honoree_name} onChange={e => setForm({ ...form, honoree_name: e.target.value })} placeholder="Ej: María" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>Teléfono (WhatsApp)</label>
            <input type="tel" value={form.honoree_phone} onChange={e => setForm({ ...form, honoree_phone: e.target.value })} placeholder="Ej: +5491112345678" style={inputStyle} />
            <p style={{ fontSize: '12px', color: '#bbb', margin: '6px 0 0' }}>Opcional. Le mandamos el regalo directo por WhatsApp.</p>
          </div>
        </div>
        <button onClick={handleNext} style={{ width: '100%', background: '#6B3FD4', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', letterSpacing: '-0.01em' }}>
          Siguiente →
        </button>
      </div>
    </div>
  );

  // Individual paso 2 — elegir tipo de regalo
  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' }}>
      {header}
      <div style={{ padding: '16px' }}>
        {error && <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>{error}</div>}
        <p style={{ fontSize: '15px', color: '#555', marginBottom: '16px', textAlign: 'center' }}>¿Cómo querés regalar a <strong>{form.honoree_name}</strong>?</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '2px solid #F0EEFF', opacity: 0.6, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, right: 14, background: '#F0EEFF', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', fontWeight: '600', color: '#7C3AED' }}>Próximamente</div>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎁</div>
            <p style={{ fontWeight: '600', fontSize: '16px', margin: '0 0 4px', color: '#1a1a1a' }}>Giftcard</p>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Enviá una tarjeta de regalo de tu marca favorita al instante.</p>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '2px solid #E9D5FF' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💸</div>
            <p style={{ fontWeight: '600', fontSize: '16px', margin: '0 0 4px', color: '#1a1a1a' }}>Monto en efectivo</p>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 14px' }}>Pagá ahora por MercadoPago y listo.</p>

            {!showAmountInput ? (
              <button onClick={() => setShowAmountInput(true)}
                style={{ width: '100%', background: '#6B3FD4', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
                Elegir monto →
              </button>
            ) : (
              <div>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '16px' }}>$</span>
                  <input
                    type="number"
                    value={individualAmount}
                    onChange={e => setIndividualAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    style={{ ...inputStyle, paddingLeft: '28px' }}
                  />
                </div>
                <button onClick={handleSubmit} disabled={loading || !individualAmount}
                  style={{ width: '100%', background: loading || !individualAmount ? '#ccc' : '#6B3FD4', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '15px', fontWeight: '500', cursor: loading || !individualAmount ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Creando...' : 'Ir a pagar 🎁'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
