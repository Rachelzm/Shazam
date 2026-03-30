# 🎵 SoundSnap — Muziekherkenning App

Een Shazam-achtige webapplicatie gebouwd met **React + Vite** als onderdeel van de Proftaak Web3.

## Functies

- 🎤 Herken muziek via je microfoon
- 🎵 Zing of neuriet een nummer en laat het herkennen
- 🎨 Realtime audio visualizer
- 🔗 Directe links naar Spotify en Apple Music
- 🎧 Preview van het nummer (indien beschikbaar)
- 🌙 Volledig donker thema

## Technologie

| Onderdeel | Technologie |
|-----------|-------------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Audio API | Web MediaRecorder API |
| Herkenning | AudD.io REST API |
| Styling | CSS Modules |

## Installatie

```bash
# Clone de repository
git clone <jouw-repo-url>
cd soundsnap

# Installeer dependencies
npm install

# Start development server
npm run dev
```

De app draait dan op `http://localhost:5173`

## API Token instellen

1. Ga naar [dashboard.audd.io](https://dashboard.audd.io/) en maak een gratis account
2. Kopieer je API token
3. Klik op het ⚙️ icoontje rechtsbovenaan in de app
4. Plak je token en klik op Opslaan

> **Demo**: Gebruik `test` als token voor een beperkte demo van de AudD API.

## Build voor productie

```bash
npm run build
```

De gebouwde bestanden staan in de `/dist` map.

## Projectstructuur

```
soundsnap/
├── src/
│   ├── components/
│   │   ├── WaveVisualizer.jsx    # Audio visualizer component
│   │   ├── SongResult.jsx        # Resultaat weergave
│   │   └── Settings.jsx          # Instellingen modal
│   ├── hooks/
│   │   └── useAudioRecorder.js   # Custom hook voor audio opname
│   ├── services/
│   │   └── recognitionService.js # AudD API integratie
│   ├── App.jsx                   # Hoofdcomponent
│   └── main.jsx                  # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Hoe het werkt

1. Gebruiker drukt op de opnameknop
2. De **Web MediaRecorder API** neemt 8 seconden audio op
3. De audio wordt als `FormData` naar de **AudD.io API** gestuurd
4. De API retourneert liedjeinformatie (titel, artiest, album, links)
5. Het resultaat wordt weergegeven met albumhoes en streaming links

## Proftaak informatie

- **Vak**: Web3  
- **Periode**: W1 t/m W4  
- **Deadline**: 3 april 2026
