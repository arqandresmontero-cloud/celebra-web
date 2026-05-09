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

  if (!getToken()) { router.replace('/login'); return null; }

  const tituloFinal = form.tituloOpcion === 'Otro' ? form.tituloCustom : form.tituloOpcion;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.honoree_name || !form.birthday_date || !tituloFinal) {
      setError('Completá nombre, fecha y tipo de celebración.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        honoree_name: form.honoree_name,
        birthday_date: form.birthday_date,
        title: tituloFinal + ' de ' + form.honoree_name,
        type: tipo,
        target_amount: form.target_amount ? Number(form.target_amount) : undefined,
        honoree_phone: form.honoree_phone || undefined,
      };
      const event = await api.createEvent(payload);
      router.push('/eventos/' + event.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#F0EEFF', border: 'none',
    borderRadius: '12px', padding: '13px', fontSize: '15px',
    color: '#1a1a1a', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = { display: 'block', color: '#999', fontSize: '13px', marginBottom: '6px' };
  const fieldWrap = { marginBottom: '14px' };

  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' }}>

      <div style={{ background: '#6B3FD4', padding: '52px 20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '22px', lineHeight: 1 }}>←</Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            {tipo === 'group' ? 'Regalo grupal' : 'Regalo individual'}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0' }}>
            {tipo === 'group' ? 'Invitá a otros y junten el regalo' : 'Enviá una giftcard al instante'}
          </p>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <form onSubmit={handleSubmit}>

          {error && (
            <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#cc0000', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px', marginTop: 0 }}>
              La celebración
            </p>

            <div style={fieldWrap}>
              <label style={labelStyle}>Nombre del homenajeado *</label>
              <input type="text" value={form.honoree_name} onChange={e => setForm({ ...form, honoree_name: e.target.value })} placeholder="Ej: María" style={inputStyle} />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Fecha *</label>
              <input type="date" value={form.birthday_date} onChange={e => setForm({ ...form, birthday_date: e.target.value })} style={inputStyle} />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>¿Qué se celebra? *</label>
              <select value={form.tituloOpcion} onChange={e => setForm({ ...form, tituloOpcion: e.target.value, tituloCustom: '' })}
                style={{ ...inputStyle, color: form.tituloOpcion ? '#1a1a1a' : '#aaa' }}>
                <option value="" disabled>Seleccioná una opción</option>
                {TITULOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {form.tituloOpcion === 'Otro' && (
              <div style={fieldWrap}>
                <label style={labelStyle}>¿Cuál? *</label>
                <input type="text" value={form.tituloCustom} onChange={e => setForm({ ...form, tituloCustom: e.target.value })} placeholder="Ej: Despedida de soltera" style={inputStyle} autoFocus />
              </div>
            )}

            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Aporte sugerido por persona ($)</label>
              <input type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} placeholder="Ej: 5000" style={inputStyle} />
              <p style={{ fontSize: '12px', color: '#bbb', margin: '6px 0 0', paddingLeft: '2px' }}>Opcional. Lo que le pedirías a cada invitado.</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#888', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px', marginTop: 0 }}>
              ¿A quién le llega el regalo?
            </p>
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Teléfono (WhatsApp)</label>
              <input type="tel" value={form.honoree_phone} onChange={e => setForm({ ...form, honoree_phone: e.target.value })} placeholder="Ej: +5491112345678" style={inputStyle} />
              <p style={{ fontSize: '12px', color: '#bbb', margin: '6px 0 0', paddingLeft: '2px' }}>Opcional. Le mandamos el regalo por WhatsApp cuando esté listo.</p>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#6B3FD4', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '-0.01em' }}>
            {loading ? 'Creando...' : '🎁 Crear regalo'}
          </button>

        </form>
      </div>
    </div>
  );
}
