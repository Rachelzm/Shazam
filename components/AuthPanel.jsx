import React, { useState } from 'react'

export function AuthPanel({ onLogin, onRegister, onLogout, onClose, user, loading, error }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError(null)

    try {
      if (mode === 'login') {
        await onLogin(email, password)
      } else {
        await onRegister(email, password)
      }
    } catch (submitError) {
      setLocalError(submitError.message || 'Authenticatie mislukt')
    }
  }

  const message = localError || error

  return (
    <div style={{position:'fixed',inset:0,zIndex:40,display:'grid',placeItems:'center',padding:24,background:'radial-gradient(circle at top, rgba(108,99,255,0.18), transparent 35%), linear-gradient(180deg, #0f0f14, #09090c)',color:'#e6eef8'}} onClick={onClose}>
      <div style={{width:'min(100%, 460px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,background:'rgba(10, 14, 24, 0.78)',backdropFilter:'blur(18px)',boxShadow:'0 24px 80px rgba(0,0,0,0.45)',padding:28}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:44,height:44,borderRadius:14,display:'grid',placeItems:'center',background:'linear-gradient(135deg, #6c63ff, #22c55e)'}}>
            <span style={{fontWeight:800,fontSize:18}}>♪</span>
          </div>
          <div>
            <div style={{fontSize:24,fontWeight:800,letterSpacing:'-0.03em'}}>SoundSnap</div>
            <div style={{color:'#9aa0b4'}}>Log in of maak een account aan</div>
          </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} style={{border:'none',background:'transparent',color:'#c8d0e0',fontSize:22,cursor:'pointer',padding:0,lineHeight:1}}>×</button>
          )}
        </div>

        {user && onLogout && (
          <div style={{marginBottom:16,padding:'12px 14px',borderRadius:14,background:'rgba(255,255,255,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
            <div>
              <div style={{fontSize:13,color:'#9aa0b4'}}>Ingelogd als</div>
              <div style={{fontWeight:700}}>{user.email}</div>
            </div>
            <button type="button" onClick={onLogout} style={{padding:'10px 14px',border:'none',borderRadius:12,background:'#ef4444',color:'#fff',fontWeight:700,cursor:'pointer'}}>Uitloggen</button>
          </div>
        )}

        <div style={{display:'flex',gap:8,marginBottom:18,padding:4,background:'rgba(255,255,255,0.04)',borderRadius:14}}>
          <button type="button" onClick={() => setMode('login')} style={{flex:1,padding:'10px 14px',border:'none',borderRadius:10,background:mode === 'login' ? '#6c63ff' : 'transparent',color:'#fff',fontWeight:700,cursor:'pointer'}}>Login</button>
          <button type="button" onClick={() => setMode('register')} style={{flex:1,padding:'10px 14px',border:'none',borderRadius:10,background:mode === 'register' ? '#6c63ff' : 'transparent',color:'#fff',fontWeight:700,cursor:'pointer'}}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{display:'block',marginBottom:12}}>
            <div style={{marginBottom:6,color:'#c8d0e0'}}>E-mail</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,0.12)',background:'#0b1220',color:'#e6eef8',outline:'none'}} />
          </label>

          <label style={{display:'block',marginBottom:16}}>
            <div style={{marginBottom:6,color:'#c8d0e0'}}>Wachtwoord</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,0.12)',background:'#0b1220',color:'#e6eef8',outline:'none'}} />
          </label>

          {message && <div style={{marginBottom:14,padding:'10px 12px',borderRadius:12,background:'rgba(239,68,68,0.12)',color:'#fecaca'}}>{message}</div>}

          <button type="submit" disabled={loading} style={{width:'100%',padding:'12px 16px',border:'none',borderRadius:12,background:'linear-gradient(135deg, #6c63ff, #5148ff)',color:'#fff',fontWeight:800,cursor:'pointer',opacity:loading ? 0.7 : 1}}>
            {loading ? 'Bezig…' : mode === 'login' ? 'Inloggen' : 'Account maken'}
          </button>
        </form>
      </div>
    </div>
  )
}