import React from 'react'

export function SongResult({ result, onReset }) {
  return (
    <div>
      <h3>Resultaat</h3>
      {result ? <div>{result.title || 'Onbekend nummer'}</div> : <div>Geen resultaat</div>}
      <button onClick={onReset}>Terug</button>
    </div>
  )
}
