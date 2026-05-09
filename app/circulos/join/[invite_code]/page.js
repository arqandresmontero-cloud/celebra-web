'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, getToken } from '@/lib/api';

export default function JoinCirculo() {
  const router = useRouter();
  const { invite_code } = useParams();
  const [status, setStatus] = useState('loading'); // loading | joining | success | error | needsLogin
  const [circleName, setCircleName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      setStatus('needsLogin');
      return;
    }
    handleJoin();
  }, []);

  const handleJoin = async () => {
    setStatus('joining');
    try {
      const circle = await api.joinCircle(invite_code);
      setCircleName(circle.name);
      setStatus('success');
      setTimeout(() => router.replace('/circulos/' + circle.id), 2000);
    } catch (e) {
      setError(e.message || 'Error al unirse al círculo');
      setStatus('error');
    }
  };

  if (status === 'loading' || status === 'joining') return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
      <p style={{ color: '#7C3AED', fontSize: '16px', fontWeight: '500' }}>Uniéndote al círculo...</p>
    </div>
  );

  if (status === 'needsLogin') return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px 24px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(109,40,217,0.08)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.5px', margin: '0 0 8px' }}>Te invitaron a un círculo</h1>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px', lineHeight: '1.5' }}>
          Iniciá sesión o creá una cuenta para unirte y organizar regalos grupales.
        </p>
        <button
          onClick={() => router.push('/login?redirect=/circulos/join/' + invite_code)}
          style={{ width: '100%', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', marginBottom: '10px' }}>
          Iniciar sesión
        </button>
        <button
          onClick={() => router.push('/register?redirect=/circulos/join/' + invite_code)}
          style={{ width: '100%', background: '#F5F3FF', color: '#7C3AED', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
          Crear cuenta
        </button>
      </div>
    </div>
  );

  if (status === 'success') return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px 24px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(109,40,217,0.08)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.5px', margin: '0 0 8px' }}>¡Te uniste!</h1>
        <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: '1.5' }}>
          Ahora sos parte de <strong style={{ color: '#7C3AED' }}>{circleName}</strong>.<br />Redirigiendo...
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '24px', padding: '32px 24px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(109,40,217,0.08)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.5px', margin: '0 0 8px' }}>Link inválido</h1>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>{error}</p>
        <button
          onClick={() => router.replace('/circulos')}
          style={{ width: '100%', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
          Ir a Círculos
        </button>
      </div>
    </div>
  );
}
