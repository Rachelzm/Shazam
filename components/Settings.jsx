import React, { useState } from 'react'

export function Settings({ token, onSave, onClose }) {
  const [value, setValue] = useState(token === 'test' ? '' : token || '')
  const handleSave = () => {
    onSave(value.trim())
    onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)'}} onClick={onClose}>
      <div style={{background:'#0f1724',padding:16,borderRadius:8,minWidth:320}} onClick={(e)=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>Instellingen</h3>
        <label style={{display:'block',marginBottom:8}}>
          AudD API Token
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="17coJ8CSAYn2kconfoJPg5nXAJpZicIMoPJBuz3ZpecGksVmiV9w29yETy6GFuDh"
            style={{width:'100%',padding:8,marginTop:6,borderRadius:4,border:'1px solid #334155',background:'#0b1220',color:'#e6eef8'}}
          />
        </label>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button onClick={onClose} style={{padding:'8px 12px'}}>Annuleren</button>
          <button onClick={handleSave} style={{padding:'8px 12px',background:'#6c63ff',color:'#fff',border:'none',borderRadius:4}}>Opslaan</button>
        </div>
      </div>
    </div>
  )
}
