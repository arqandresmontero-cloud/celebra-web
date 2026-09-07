'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setToken } from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', birthday: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.register(form);
      setToken(token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>
            celebra<span style={{ color: '#FFD700' }}>.</span>
          </h1>
          <p style={{ color: '#888', marginTop: '8px' }}>Organizá regalos grupales fácil</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#1a1a1a', borderRadius: '16px', padding: '32px', border: '1px solid #2a2a2a' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Crear cuenta</h2>

          {error && (
            <div style={{ background: '#2a1a1a', border: '1px solid #ff4444', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#ff6666', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '6px' }}>Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="Tu nombre"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '6px' }}>Teléfono con código de país</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
              style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="Ej: 5492281633229"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '6px' }}>Fecha de cumpleaños</label>
            <input
              type="date"
              value={form.birthday}
              onChange={e => setForm({ ...form, birthday: e.target.value })}
              required
              style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box', colorScheme:'dark' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#888', fontSize: '14px', marginBottom: '6px' }}>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: '#FFD700', textDecoration: 'none', fontWeight: '600' }}>
              Iniciá sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
