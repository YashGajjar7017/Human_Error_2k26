import React, { useState } from 'react'

export default function CodeEditor({ value, onChange, language }){
  return (
    <div>
      <textarea
        aria-label="Code editor"
        style={{width:'100%',height:300,fontFamily:'monospace',fontSize:13,padding:10,borderRadius:6,border:'1px solid #ddd'}}
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={`Write your ${language || 'code'} here...`}
      />
    </div>
  )
}
