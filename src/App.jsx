import { useState, useEffect } from 'react'
import './index.css'
import Background from './componentes/Background/Background'
import Navbar from './componentes/Navbar/Navbar'
import Hero   from './componentes/Hero/Hero'
import Panel  from './componentes/Panel/Panel'
import Historial from './componentes/Historial/Historial'

function App() {
  const [currentView, setCurrentView] = useState(() => window.location.hash || '#interno')

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(window.location.hash || '#interno')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      {/* Capa decorativa fija detrás de todo */}
      <Background />

      {/* Contenido principal encima del fondo */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <main style={{ paddingTop: 'var(--nav-height)' }}>
          {(() => {
            switch(currentView) {
              case '#historial':
                return <Historial />
              case '#panel':
                return <Panel />
              case '#interno':
              default:
                return <Hero />
            }
          })()}
        </main>
      </div>
    </>
  )
}

export default App
