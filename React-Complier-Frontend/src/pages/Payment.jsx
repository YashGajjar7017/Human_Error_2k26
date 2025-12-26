import React, { useState } from 'react';

export default function Payment(){
  const [amount, setAmount] = useState(500);
  const [currency, setCurrency] = useState('usd');
  const [description, setDescription] = useState('Subscription');
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);

  const createCheckout = async () => {
    setLoading(true); setError(null); setQr(null); setLink(null);
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: Math.round(amount), currency, description })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create checkout');
      setQr(data.qr);
      setLink(data.url);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally { setLoading(false); }
  }

  const copyLink = () => { if (link) navigator.clipboard.writeText(link).then(() => alert('Copied link')); }

  return (
    <div style={{display:'flex', justifyContent:'center', padding:24}}>
      <div style={{width:720, background:'rgba(255,255,255,0.06)', borderRadius:12, padding:20, backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,0.06)'}}>
        <h2 style={{color:'#fff'}}>💳 Checkout (Glassy)</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div>
            <label style={{color:'#cbd5e1'}}>Amount (cents)</label>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%', padding:8, borderRadius:8, border:'1px solid #333'}} />
          </div>
          <div>
            <label style={{color:'#cbd5e1'}}>Currency</label>
            <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{width:'100%', padding:8, borderRadius:8, border:'1px solid #333'}}>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
            </select>
          </div>
          <div style={{gridColumn:'1 / -1'}}>
            <label style={{color:'#cbd5e1'}}>Description</label>
            <input value={description} onChange={e=>setDescription(e.target.value)} style={{width:'100%', padding:8, borderRadius:8, border:'1px solid #333'}} />
          </div>
        </div>

        <div style={{display:'flex', gap:8, marginTop:16}}>
          <button onClick={createCheckout} disabled={loading} style={{padding:'10px 16px', background:'#06b6d4', color:'#062f4f', fontWeight:700, borderRadius:8}}>Create Checkout</button>
          <button onClick={()=>{ setQr(null); setLink(null); }} style={{padding:'10px 16px', borderRadius:8}}>Clear</button>
        </div>

        {loading && <p style={{color:'#9ca3af'}}>Creating checkout...</p>}
        {error && <p style={{color:'#fda4af'}}>{error}</p>}

        {link && (
          <div style={{marginTop:18}}>
            <h4 style={{color:'#fff'}}>Payment Link</h4>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <input readOnly value={link} style={{flex:1, padding:8, borderRadius:8, border:'1px solid rgba(255,255,255,0.06)', background:'transparent', color:'#fff'}} />
              <button onClick={copyLink}>Copy</button>
              <a href={link} target="_blank" rel="noreferrer"><button>Open</button></a>
            </div>
          </div>
        )}

        {qr && (
          <div style={{marginTop:18}}>
            <h4 style={{color:'#fff'}}>QR Code</h4>
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <img src={qr} alt="Payment QR" style={{width:200, height:200, background:'#fff', padding:8, borderRadius:8}} />
              <div>
                <a href={qr} download="payment_qr.png"><button>Download QR</button></a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}