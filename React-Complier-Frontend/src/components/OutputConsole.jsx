import React from 'react'

export default function OutputConsole({ lines }){
  return (
    <div style={{background:'#0b0b0b',color:'#e6e6e6',padding:12,borderRadius:6,marginTop:12,maxHeight:300,overflowY:'auto',fontFamily:'monospace',fontSize:13}}>
      {lines.length === 0 ? <div style={{opacity:0.6}}>No output yet</div> : lines.map((l,i)=>(<div key={i}>{l}</div>))}
    </div>
  )
}
