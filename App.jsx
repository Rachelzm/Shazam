import React, { useState, useEffect } from 'react'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { useHistory } from './hooks/useHistory'
import { useAuth } from './hooks/useAuth'
import { recognizeSong } from './services/recognitionService'
import { WaveVisualizer } from './components/WaveVisualizer'
import { SongResult } from './components/SongResult'
import { Settings } from './components/Settings'
import { HistoryPanel } from './components/HistoryPanel'
import { AuthPanel } from './components/AuthPanel'
import styles from './App.module.css'

const RECORD_DURATION = 8000

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12 8 12 12 14 14"/>
      <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
      <polyline points="3 3 3 7 7 7"/>
    </svg>
  )
}

function IconAccount() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 10-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconMic() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
    </svg>
  )
}

export default function App() {
  const { token: authToken, user, loading, login, register, logout, isAuthenticated } = useAuth()
  // DEV HMR badge to confirm live reload
  const [devBadgeToggle, setDevBadgeToggle] = useState(false)
  useEffect(() => { const t = setInterval(() => setDevBadgeToggle((s) => !s), 1000); return () => clearInterval(t) }, [])
  const [appState, setAppState] = useState('idle')
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAuthPanel, setShowAuthPanel] = useState(false)
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('audd_token') || 'test')
  const [countdown, setCountdown] = useState(null)
  const [progress, setProgress] = useState(0)

  const { isRecording, audioBlob, error: recError, audioLevel, startRecording, stopRecording } = useAudioRecorder()
  const { history, addEntry, clearHistory } = useHistory(authToken)

  useEffect(() => {
    if (isRecording) {
      setCountdown(RECORD_DURATION / 1000)
      setProgress(0)
      const start = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - start
        setProgress(Math.min((elapsed / RECORD_DURATION) * 100, 100))
        setCountdown(Math.max(0, Math.ceil((RECORD_DURATION - elapsed) / 1000)))
        if (elapsed >= RECORD_DURATION) clearInterval(interval)
      }, 100)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [isRecording])

  useEffect(() => {
    if (audioBlob && appState === 'recording') {
      setAppState('analyzing')
      recognizeSong(audioBlob, apiToken)
        .then((res) => {
          setResult(res)
          if (res) addEntry(res)
          setAppState('result')
        })
        .catch((err) => {
          setApiError(err.message)
          setAppState('result')
        })
    }
  }, [audioBlob])

  const handleRecord = () => {
    if (appState !== 'idle') return
    setApiError(null)
    setResult(null)
    setAppState('recording')
    startRecording(RECORD_DURATION)
  }

  const handleStop = () => {
    stopRecording()
  }

  const handleReset = () => {
    setAppState('idle')
    setResult(null)
    setApiError(null)
  }

  const handleSaveToken = (token) => {
    setApiToken(token)
    localStorage.setItem('audd_token', token)
  }

  const handleSelectHistory = (song) => {
    setResult(song)
    setAppState('result')
    setApiError(null)
  }

  const displayError = recError || apiError

  if (loading) {
    return (
      <div className={styles.app} style={{display:'grid',placeItems:'center',minHeight:'100vh'}}>
        <div style={{color:'#e6eef8'}}>Session laden…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPanel onLogin={login} onRegister={register} loading={loading} />
  }

  return (
    <div className={styles.app}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#6c63ff" strokeWidth="1.5"/>
              <path d="M8 12 Q12 6 16 12 Q12 18 8 12" fill="#6c63ff"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          </div>
          <span className={styles.logoText}>SoundSnap</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={() => setShowAuthPanel(true)} title="Login / Account" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 14px',width:'auto'}}>
            <IconAccount />
            <span style={{fontSize:14,fontWeight:700}}>Account</span>
          </button>
          {user?.email && <span style={{color:'#9aa0b4',fontSize:14}}>{user.email}</span>}
          <button className={styles.iconBtn} onClick={() => setShowHistory(true)} title="Geschiedenis">
            <IconHistory />
            {history.length > 0 && <span className={styles.badge}>{history.length}</span>}
          </button>
          <button className={styles.iconBtn} onClick={() => setShowSettings(true)} title="Instellingen">
            <IconSettings />
          </button>
        </div>
      </header>

      {/* Recording progress bar */}
      <div className={styles.progressTrack}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%`, opacity: appState === 'recording' ? 1 : 0 }}
        />
      </div>

      <main className={styles.main}>
        {appState !== 'result' ? (
          <>
            <div className={styles.hero}>
              <h1 className={styles.title}>
                {appState === 'idle' && 'Wat speelt er?'}
                {appState === 'recording' && 'Luistert…'}
                {appState === 'analyzing' && 'Herkennen…'}
              </h1>
              <p className={styles.subtitle}>
                {appState === 'idle' && <>Hou je telefoon bij de muziek,<br />of zing / neuriet het nummer zelf.</>}
                {appState === 'recording' && `${countdown}s — zing of laat het afspelen`}
                {appState === 'analyzing' && 'Even geduld, AudD.io zoekt het op…'}
              </p>
            </div>

            <WaveVisualizer
              audioLevel={audioLevel}
              isRecording={appState === 'recording'}
              state={appState === 'analyzing' ? 'analyzing' : appState === 'recording' ? 'recording' : 'idle'}
            />

            <div className={styles.buttonArea}>
              {appState === 'idle' && (
                <button className={styles.recordBtn} onClick={handleRecord} aria-label="Start herkenning">
                  <div className={styles.recordInner}><IconMic /></div>
                  <span className={styles.recordPulse} />
                  <span className={styles.recordPulse2} />
                </button>
              )}
              {appState === 'recording' && (
                <button className={styles.stopBtn} onClick={handleStop} aria-label="Stop opname">
                  <div className={styles.stopIcon} />
                </button>
              )}
              {appState === 'analyzing' && (
                <div className={styles.spinner}>
                  <div className={styles.spinnerRing} />
                  <span className={styles.spinnerNote}>♪</span>
                </div>
              )}
            </div>

            {appState === 'idle' && <p className={styles.hint}>Tikken om te beginnen</p>}
          </>
        ) : (
          <SongResult result={result} onReset={handleReset} />
        )}

        {displayError && (
          <div className={styles.errorBanner}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{displayError}</span>
            <button onClick={handleReset}>✕</button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>SoundSnap · React + Vite · AudD.io API · Proftaak Web3</p>
      </footer>

      {showSettings && (
        <Settings token={apiToken} onSave={handleSaveToken} onClose={() => setShowSettings(false)} />
      )}
      {showHistory && (
        <HistoryPanel
          history={history}
          onSelect={handleSelectHistory}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showAuthPanel && (
        <AuthPanel
          user={user}
          onLogin={login}
          onRegister={register}
          onLogout={logout}
          onClose={() => setShowAuthPanel(false)}
        />
      )}
    </div>
  )
}
