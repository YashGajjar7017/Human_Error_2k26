import React, {useEffect, useState} from 'react'

export default function Home(){
  const [languages, setLanguages] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function fetchLanguages(){
      try{
        const res = await (await import('../api')).apiFetch('/api/compiler/languages')
        const j = await res.json()
        if (j.success) setLanguages(j.languages)
      }catch(err){
        console.error('Could not fetch languages', err)
      }finally{setLoading(false)}
    }
    fetchLanguages()
  },[])

  return (
    <div className="container" style={{marginTop:20}}>
      <h1>Welcome to Human Error — Compiler Platform</h1>
      <p>Write, compile and run code across supported languages. This SPA is fully dynamic and powered by backend APIs.</p>

      <section style={{marginTop:20}}>
        <h3>Supported Languages</h3>
        {loading && <div>Loading supported languages...</div>}
        {!loading && !languages && <div>No languages detected</div>}
        {!loading && languages && (
          <ul>
            {Object.keys(languages).map(k => (
              <li key={k}><strong>{languages[k].name}</strong> — features: {languages[k].features.join(', ')}</li>
            ))}
          </ul>
        )}
      </section>

      <section style={{marginTop:20}}>
        <h3>Quick links</h3>
        <ul>
          <li><a href="/compiler">Open Compiler</a></li>
          <li><a href="/login">Login</a></li>
        </ul>
      </section>

    </div>
  )
}
