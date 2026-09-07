'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, getToken } from '@/lib/api';

const pendingJoins = new Map();

function joinCircleOnce(inviteCode) {
  if (!pendingJoins.has(inviteCode)) {
    const request = api.joinCircle(inviteCode)
      .finally(() => pendingJoins.delete(inviteCode));
    pendingJoins.set(inviteCode, request);
  }
  return pendingJoins.get(inviteCode);
}

export default function JoinCirculo() {
  const router = useRouter();
  const { invite_code } = useParams();
  const [status, setStatus] = useState('joining');
  const [circleName, setCircleName] = useState('');
  const [error, setError] = useState('');
  const needsProfile = error.includes('Completá tu teléfono');

  useEffect(() => {
    if (!invite_code) return;

    if (!getToken()) {
      const redirect = `/circulos/join/${invite_code}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    let active = true;
    let redirectTimer;

    const joinCircle = async () => {
      try {
        const circle = await joinCircleOnce(invite_code);
        if (!active) return;
        setCircleName(circle.name);
        setStatus('success');
        redirectTimer = window.setTimeout(() => {
          router.replace('/circulos/' + circle.id);
        }, 2000);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Error al unirse al círculo');
        setStatus('error');
      }
    };

    joinCircle();

    return () => {
      active = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [invite_code, router]);

  if (status === 'joining') return (
    <div style={{ minHeight: '100vh', background: '#F0EEFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
      <p style={{ color: '#7C3AED', fontSize: '16px', fontWeight: '500' }}>Uniéndote al círculo...</p>
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
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.5px', margin: '0 0 8px' }}>{needsProfile ? 'Completá tu perfil' : 'Link inválido'}</h1>
        <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>{error}</p>
        <button
          onClick={() => router.replace(needsProfile ? '/perfil' : '/circulos')}
          style={{ width: '100%', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
          {needsProfile ? 'Ir a Perfil' : 'Ir a Círculos'}
        </button>
      </div>
    </div>
  );
}
