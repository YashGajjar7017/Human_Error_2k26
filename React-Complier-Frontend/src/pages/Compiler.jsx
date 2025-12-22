import React, {useState} from 'react'
import CodeEditor from '../components/CodeEditor'
import OutputConsole from '../components/OutputConsole'

export default function Compiler(){
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('// console.log("Hello world");')
  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(false)

  function addLog(line){ setLogs(prev => [...prev, line]) }

  async function runCode(){
    setRunning(true)
    setLogs([])
    addLog('Sending code to server...')
    try{
      const resp = await (await import('../api')).apiFetch('/api/compiler/compile-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code, language })
      })
      const j = await resp.json()
      if (!j.success){ addLog('Error: ' + (j.error || JSON.stringify(j))) }
      else {
        addLog('✅ Compilation finished')
        // Show any stdout / stderr from result.result
        const result = j.result || {}
        if (result.stdout) addLog('Output:\n' + result.stdout)
        if (result.stderr) addLog('Errors:\n' + result.stderr)
        if (result.output) addLog('Execution result:\n' + JSON.stringify(result.output))
      }
    }catch(err){ addLog('Exception: ' + err.message) }
    finally{ setRunning(false) }
  }

  return (
    <div className="container" style={{marginTop:20}}>
      <h2>Compiler</h2>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:320}}>
          <label>Language</label>
          <select value={language} onChange={e=>setLanguage(e.target.value)} style={{marginBottom:8}}>
            <option value="javascript">JavaScript (node)</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          <CodeEditor value={code} onChange={setCode} language={language} />

          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button onClick={runCode} disabled={running} className="btn btn-primary">{running ? 'Running...' : 'Run'}</button>
            <button onClick={()=>{ setCode('') }} className="btn">Clear</button>
          </div>
        </div>

        <div style={{width:420}}>
          <h3>Output Console</h3>
          <OutputConsole lines={logs} />
        </div>
      </div>
    </div>
  )
}
