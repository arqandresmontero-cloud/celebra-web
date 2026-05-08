'use client';
import Link from 'next/link';
export default function PaymentFailure() {
  return (
    <div style={{ minHeight:'100vh', background:'#F0EEFF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui, sans-serif', padding:'24px' }}>
      <div style={{ background:'#fff', borderRadius:'24px', padding:'40px', maxWidth:'400px', width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>😕</div>
        <h2 style={{ fontSize:'22px', fontWeight:'700', color:'#1a1a1a', marginBottom:'8px' }}>El pago no se completó</h2>
        <p style={{ color:'#999', marginBottom:'32px' }}>Podés intentarlo de nuevo cuando quieras.</p>
        <Link href="/dashboard" style={{ display:'block', background:'#7C3AED', color:'#fff', borderRadius:'14px', padding:'14px', textDecoration:'none', fontWeight:'700', fontSize:'16px' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
