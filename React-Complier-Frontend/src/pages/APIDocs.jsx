import React, {useEffect, useState} from 'react'

export default function APIDocs(){
  const [docs, setDocs] = useState(null)
  useEffect(()=>{
    fetch('/api/docs').then(r=>r.json()).then(j=>setDocs(j)).catch(()=>{})
  },[])
  return (
    <div className="container" style={{marginTop:20}}>
      <h1>API Docs</h1>
      <p>Auto-fetched API docs endpoint summary.</p>
      <pre style={{whiteSpace:'pre-wrap',background:'#fff',padding:12,borderRadius:6}}>{JSON.stringify(docs, null, 2)}</pre>
    </div>
  )
}
