'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { activateSuggestedEvent } from '@/lib/api';

export default function ActivarRegaloSheet({ suggested, onClose }) {
  const router = useRouter();
  const [amount, setAmount] = useState(suggested.suggested_amount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await activateSuggestedEvent(suggested.id, amount ? Number(amount) : null);
      if (res.event) {
        router.push(`/eventos/${res.event.id}`);
      } else {
        setError(res.error || 'Error al activar');
        setLoading(false);
      }
    } catch (e) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg)', borderRadius: '20px 20px 0 0',
        padding: '32px 24px 40px', width: '100%', maxWidth: '480px'
      }} onClick={e => e.stopPropagation()}>

        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }} />

        <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>🎁</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>
          Activar regalo
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>
          {suggested.title || `Cumpleaños de ${suggested.person_name}`}
          {suggested.event_date && (
            <span style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
              {new Date('2000-' + suggested.event_date.slice(5,10)).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
            </span>
          )}
        </p>

        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          APORTE SUGERIDO (opcional)
        </label>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-secondary)', fontSize: 16
          }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            style={{
              width: '100%', padding: '14px 14px 14px 28px',
              borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', fontSize: 16,
              color: 'var(--text)', boxSizing: 'border-box'
            }}
          />
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

        <button
          onClick={handleActivar}
          disabled={loading}
          style={{
            width: '100%', padding: '16px',
            background: loading ? 'var(--border)' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creando regalo...' : 'Crear regalo 🎉'}
        </button>

        <button onClick={onClose} style={{
          width: '100%', marginTop: 12, padding: '14px',
          background: 'transparent', border: 'none',
          color: 'var(--text-secondary)', fontSize: 15, cursor: 'pointer'
        }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
