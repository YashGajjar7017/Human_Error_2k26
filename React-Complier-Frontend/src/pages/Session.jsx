import React, { useState } from 'react';

export default function Session(){
  const [sessionId, setSessionId] = useState('');
  const [linkData, setLinkData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShare = async () => {
    setLoading(true); setError(null); setLinkData(null); setQrData(null);
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/share/link`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'No link');
      setLinkData(data.link);

      const qrRes = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/share/qr`);
      const qrJson = await qrRes.json();
      if (qrJson.success) setQrData(qrJson.qr);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const copyLink = () => {
    if (!linkData) return;
    navigator.clipboard.writeText(linkData).then(() => alert('Link copied to clipboard'));
  }

  return (
    <div className="container" style={{marginTop:20}}>
      <h1>Session</h1>
      <p>Enter session id to get a quick share link or QR code for joining a session.</p>

      <div style={{display:'flex', gap:8, alignItems:'center', marginTop:12}}>
        <input placeholder="Session ID" value={sessionId} onChange={e => setSessionId(e.target.value)} style={{padding:8, borderRadius:6, border:'1px solid #ddd'}} />
        <button onClick={fetchShare} disabled={!sessionId || loading} style={{padding:'8px 12px'}}>Get Share</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}

      {linkData && (
        <div style={{marginTop:16}}>
          <h4>Join Link</h4>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input readOnly value={linkData} style={{flex:1, padding:8, borderRadius:6, border:'1px solid #eee'}} />
            <button onClick={copyLink}>Copy</button>
            <a href={linkData} target="_blank" rel="noreferrer"><button>Open</button></a>
          </div>
        </div>
      )}

      {qrData && (
        <div style={{marginTop:16}}>
          <h4>QR Code</h4>
          <img src={qrData} alt="Join QR" style={{width:200, height:200, background:'#fff', padding:8, borderRadius:8}} />
          <div style={{marginTop:8}}>
            <a href={qrData} download={`session_${sessionId}_qr.png`}><button>Download QR</button></a>
          </div>
        </div>
      )}
    </div>
  )
}
