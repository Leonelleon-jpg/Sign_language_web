import { useState, useEffect } from 'react'
import './App.css'

const BACKEND_URL = 'http://localhost:5000'

function App() {
  const [cameraActive, setCameraActive] = useState(true)
  const [cameraError, setCameraError] = useState(false)
  const [currentSign, setCurrentSign] = useState('—')
  const [savedText, setSavedText] = useState('')
  const [audioEnabled, setAudioEnabled] = useState(true)

  // Consulta periódica al backend para obtener la letra o palabra detectada
  useEffect(() => {
    if (!cameraActive) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/translation`)
        if (res.ok) {
          const data = await res.json()
          if (data.current && data.current !== '-') {
            setCurrentSign(data.current)
          }
        }
      } catch {
        // Silencioso mientras el backend no esté corriendo o no haya predicción nueva
      }
    }, 500)

    return () => clearInterval(interval)
  }, [cameraActive])

  // Función para leer en voz alta cuando el audio está habilitado
  const speakText = (text) => {
    if (!audioEnabled || !text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-MX'
    window.speechSynthesis.speak(utterance)
  }

  // Habilitar / Deshabilitar audio
  const handleToggleAudio = () => {
    const nextState = !audioEnabled
    setAudioEnabled(nextState)
    if (!nextState && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // Encender / Apagar cámara en el backend
  const handleToggleCamera = async () => {
    const nextState = !cameraActive
    setCameraActive(nextState)
    setCameraError(false)
    try {
      await fetch(`${BACKEND_URL}/api/camera/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState }),
      })
    } catch {
      if (nextState) setCameraError(true)
    }
  }

  // Limpiar el texto guardado
  const handleClearText = () => {
    setSavedText('')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Traductor de Lenguaje de Señas a Voz</h1>
        <p className="subtitle">Traducción en tiempo real mediante visión por computadora</p>
      </header>

      <main className="translator-layout">
        {/* Fila superior: Frame de la cámara web + Pequeño recuadro de traducción actual al lado */}
        <section className="top-section">
          {/* Frame de la cámara web */}
          <div className="camera-card">
            <div className="card-header">
              <span className="status-indicator">
                <span className={`dot ${cameraActive && !cameraError ? 'live' : 'off'}`} />
                Cámara Web en Tiempo Real
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleToggleCamera}
              >
                {cameraActive ? 'Apagar Cámara' : 'Encender Cámara'}
              </button>
            </div>

            <div className="camera-frame">
              {cameraActive && !cameraError ? (
                <img
                  src={`${BACKEND_URL}/video_feed`}
                  alt="Stream de cámara web desde el backend en Python"
                  className="camera-stream"
                  onError={() => setCameraError(true)}
                />
              ) : (
                <div className="camera-placeholder">
                  <span className="camera-icon">📷</span>
                  {cameraError ? (
                    <>
                      <p>No se pudo conectar con la cámara del Backend.</p>
                      <small>
                        Asegúrate de que el servidor Python esté ejecutándose en{' '}
                        <code>{BACKEND_URL}</code>
                      </small>
                    </>
                  ) : (
                    <p>La cámara está desactivada</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pequeño recuadro al lado del frame de la cámara: palabra o letra traducida */}
          <aside className="current-translation-box">
            <div className="card-header">
              <span>Traducción Actual</span>
            </div>
            <div className="detected-sign-content">
              <span className="detected-label">Letra / Palabra</span>
              <div className="detected-value">{currentSign}</div>
            </div>
          </aside>
        </section>

        {/* Debajo del frame de la cámara: Frame del texto guardado + Botón de audio */}
        <section className="bottom-section">
          {/* Frame para mostrar el texto que se va guardando */}
          <div className="saved-text-frame">
            <div className="card-header">
              <span>Texto Guardado</span>
              <div className="saved-text-actions">
                <button
                  type="button"
                  className="btn-small"
                  onClick={() => speakText(savedText)}
                  disabled={!audioEnabled || !savedText}
                  title="Reproducir texto guardado en voz"
                >
                  🔊 Reproducir
                </button>
                <button
                  type="button"
                  className="btn-small"
                  onClick={handleClearText}
                  disabled={!savedText}
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="saved-text-body">
              {savedText ? (
                <p className="saved-text-content">{savedText}</p>
              ) : (
                <p className="saved-text-placeholder">
                  Aquí se irá mostrando y guardando el texto traducido en tiempo real...
                </p>
              )}
            </div>
          </div>

          {/* Botón para habilitar o deshabilitar el audio debajo del frame de la cámara */}
          <div className="audio-controls">
            <button
              type="button"
              className={`btn-audio ${audioEnabled ? 'enabled' : 'disabled'}`}
              onClick={handleToggleAudio}
            >
              <span className="audio-icon">{audioEnabled ? '🔊' : '🔇'}</span>
              <span>{audioEnabled ? 'Deshabilitar Audio' : 'Habilitar Audio'}</span>
            </button>
            <span className={`audio-status-badge ${audioEnabled ? 'active' : 'muted'}`}>
              Audio: {audioEnabled ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
