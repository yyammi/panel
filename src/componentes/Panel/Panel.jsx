import { useState, useEffect, useCallback } from 'react'
import './Panel.css'

const HOY_KEY = `registros_${new Date().toISOString().slice(0, 10)}`

function cargarRegistros() {
  return JSON.parse(localStorage.getItem(HOY_KEY) || '[]')
}

export default function Panel() {
  const [registros, setRegistros] = useState(cargarRegistros)
  const [filtro, setFiltro] = useState('')

  const [modal, setModal] = useState(null)
  const [pin, setPin] = useState('')
  const [obs, setObs] = useState('')
  const [modalError, setModalError] = useState('')

  // Escuchar actualizaciones de Hero
  const actualizar = useCallback(() => {
    setRegistros(cargarRegistros())
  }, [])

  useEffect(() => {
    window.addEventListener('registros-updated', actualizar)
    return () => window.removeEventListener('registros-updated', actualizar)
  }, [actualizar])

  useEffect(() => {
    const handleGlobalSearch = (e) => setFiltro(e.detail)
    window.addEventListener('global-search', handleGlobalSearch)
    return () => window.removeEventListener('global-search', handleGlobalSearch)
  }, [])

  const accionarConClave = (onSuccess) => {
    const claveGuardada = localStorage.getItem('admin_password')
    if (!claveGuardada) {
      setModal({
        titulo: "Crear Clave Maestra",
        desc: "Aún no tenés una clave. Creá una ahora para proteger tus datos.",
        onConfirm: (val) => {
          localStorage.setItem('admin_password', val)
          onSuccess()
          return true
        }
      })
    } else {
      setModal({
        titulo: "Verificar Identidad",
        desc: "Ingresá tu clave maestra para continuar.",
        onConfirm: (val) => {
          if (val === claveGuardada) {
            onSuccess()
            return true
          }
          setModalError("Clave incorrecta. Intentá nuevamente.")
          return false
        }
      })
    }
  }

  const handleLimpiar = () => {
    if (registros.length === 0) {
      alert("No hay registros para limpiar.")
      return
    }
    const claveGuardada = localStorage.getItem('admin_password')
    if (!claveGuardada) {
      alert("Debes crear una clave primero en el Panel.")
      return
    }
    setModal({
      titulo: "Limpiar y Archivar",
      desc: "Se generará un archivo Excel/CSV y se limpiará la planilla. Ingresá tu clave para confirmar.",
      onConfirm: (val) => {
        if (val !== claveGuardada) {
          setModalError("Clave incorrecta.")
          return false
        }
        localStorage.setItem(`historico_${Date.now()}`, JSON.stringify(registros))
        localStorage.removeItem(HOY_KEY)
        setRegistros([])
        return true
      }
    })
  }

  const handleEliminar = (id) => {
    const claveGuardada = localStorage.getItem('admin_password')
    if (!claveGuardada) {
      alert("Debes crear una clave primero en el Panel.")
      return
    }
    setModal({
      titulo: "Eliminar Movimiento",
      desc: "Ingresá tu clave e indicá el motivo de la eliminación.",
      requireText: true,
      textLabel: "Motivo de eliminación",
      onConfirm: (val, obsVal) => {
        if (val !== claveGuardada) {
          setModalError("Clave incorrecta.")
          return false
        }
        
        // 1. Encontrar el registro actual
        const rToDelete = registros.find(r => r.id === id)
        if (!rToDelete) return true
        
        // 2. Marcar como eliminado y añadir la observación
        const archivado = { ...rToDelete, eliminado: true, observacion: "Eliminado - " + obsVal }
        
        // 3. Crear un bloque histórico para mandar a "Historial" ya mismo
        localStorage.setItem(`historico_${Date.now()}`, JSON.stringify([archivado]))

        // 4. Borrar completamente del Panel de hoy
        const nuevos = registros.filter(r => r.id !== id)
        localStorage.setItem(HOY_KEY, JSON.stringify(nuevos))
        setRegistros(nuevos)
        
        return true
      }
    })
  }

  const handleCambiarClave = () => {
    const claveGuardada = localStorage.getItem('admin_password')
    if (!claveGuardada) {
      accionarConClave(() => {})
      return
    }
    setModal({
      titulo: "Crear Nueva Clave",
      desc: "Primero ingresá tu clave actual para verificar tu identidad.",
      onConfirm: (val) => {
        if (val === claveGuardada) {
          setTimeout(() => {
            setModal({
              titulo: "Nueva Clave",
              desc: "Ingresá tu nueva clave maestra.",
              onConfirm: (newVal) => {
                localStorage.setItem('admin_password', newVal)
                alert("Clave actualizada correctamente.")
                return true
              }
            })
          }, 0)
          return true
        }
        setModalError("Clave actual incorrecta.")
        return false
      }
    })
  }

  const cerrarModal = () => {
    setModal(null)
    setPin('')
    setObs('')
    setModalError('')
  }

  const handleModalSubmit = (e) => {
    e.preventDefault()
    if (!pin.trim()) {
      setModalError("La clave no puede estar vacía.")
      return
    }
    if (modal.requireText && !obs.trim()) {
      setModalError("Debe ingresar el motivo.")
      return
    }
    const success = modal.onConfirm(pin, obs)
    if (success) cerrarModal()
  }

  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const registrosFiltrados = registros.filter((r) => {
    const q = filtro.toLowerCase()
    return (
      r.nombre.toLowerCase().includes(q) ||
      r.rol.toLowerCase().includes(q) ||
      r.tipo.toLowerCase().includes(q)
    )
  })

  const totalIngresos = registros.filter((r) => r.tipo === 'ingreso' && !r.eliminado).length
  const totalEgresos  = registros.filter((r) => r.tipo === 'egreso' && !r.eliminado).length
  const activos = registros.filter(r => !r.eliminado).length

  return (
    <section className="panel" id="panel">
      <div className="panel__container">

        {/* Header */}
        <div className="panel__header">
          <div className="panel__header-top">
            <div>
              <span className="panel__badge">Planilla Diaria</span>
              <h2 className="panel__title">Panel de Movimientos</h2>
              <p className="panel__date">{fechaHoy}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button
                id="btn-limpiar"
                className="panel__clear-btn panel__clear-btn--danger"
                onClick={handleLimpiar}
                title="Borrar registros de hoy"
              >
                🗑 Limpiar día
              </button>
              <button
                className="panel__clear-btn"
                style={{ opacity: 0.6 }}
                onClick={handleCambiarClave}
                title="Cambiar contraseña de seguridad"
              >
                🔑
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="panel__stats">
            <div className="panel__stat panel__stat--total">
              <span className="panel__stat-num">{activos}</span>
              <span className="panel__stat-label">Movimientos</span>
            </div>
            <div className="panel__stat panel__stat--in">
              <span className="panel__stat-num">{totalIngresos}</span>
              <span className="panel__stat-label">Ingresos</span>
            </div>
            <div className="panel__stat panel__stat--out">
              <span className="panel__stat-num">{totalEgresos}</span>
              <span className="panel__stat-label">Egresos</span>
            </div>
          </div>

          {/* Filtro local */}
          {registros.length > 0 && (
            <div className="panel__filter-wrap">
              <svg className="panel__filter-icon" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="panel-filtro"
                type="search"
                className="panel__filter"
                placeholder="Filtrar por nombre, rol o tipo..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}
        </div>

        {/* Tabla / Planilla */}
        {registrosFiltrados.length === 0 ? (
          <div className="panel__empty">
            <span className="panel__empty-icon">📋</span>
            <p>
              {registros.length === 0
                ? 'Aún no hay registros para el día de hoy.'
                : 'Ningún resultado coincide con el filtro.'}
            </p>
            {registros.length === 0 && (
              <a href="#interno" className="panel__empty-link">
                → Ir a registrar un movimiento
              </a>
            )}
          </div>
        ) : (
          <div className="panel__table-wrap">
            <table className="panel__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre y Apellido</th>
                  <th>Rol / Área</th>
                  <th>Movimiento</th>
                  <th>Hora</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((r, idx) => (
                  <tr key={r.id} className={`panel__row panel__row--${r.eliminado ? 'eliminado' : r.tipo}`}>
                    <td className="panel__row-num">{idx + 1}</td>
                    <td className="panel__row-nombre">
                      {r.nombre}
                      {r.eliminado && (
                        <div style={{ fontSize:'0.75rem', marginTop:'2px', color:'var(--color-danger-text)', textDecoration:'none' }}>
                          Cancelado: {r.observacion}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="panel__row-rol">{r.rol}</span>
                    </td>
                    <td>
                      <span className={`panel__badge-tipo panel__badge-tipo--${r.eliminado ? 'eliminado' : r.tipo}`}>
                        {r.eliminado ? 'tachado' : (r.tipo === 'ingreso' ? '↗ ingresó' : '↙ egresó')}
                      </span>
                    </td>
                    <td className="panel__row-hora">
                      <span className="panel__hora-chip">{r.hora}hs</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="panel__delete-btn" 
                        title="Eliminar movimiento" 
                        onClick={() => handleEliminar(r.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer nota */}
        {registros.length > 0 && (
          <p className="panel__footer-note">
            💾 Los registros se guardan localmente en este navegador y se resetean cada día.
          </p>
        )}

      </div>

      {/* Security Modal */}
      {modal && (
        <div className="panel__modal-overlay" onClick={cerrarModal}>
          <div className="panel__modal" onClick={e => e.stopPropagation()}>
            <h3 className="panel__modal-title">🔐 {modal.titulo}</h3>
            <p className="panel__modal-desc">{modal.desc}</p>
            <form onSubmit={handleModalSubmit}>
              <input
                type="password"
                className={`panel__modal-input ${modalError && !obs ? 'error' : ''}`}
                placeholder="Introducir Clave ••••••••"
                value={pin}
                onChange={e => { setPin(e.target.value); setModalError('') }}
                autoFocus
              />
              {modal.requireText && (
                <input
                  type="text"
                  className={`panel__modal-input ${modalError && obs.length===0 ? 'error' : ''}`}
                  placeholder={modal.textLabel || "Motivo..."}
                  value={obs}
                  onChange={e => { setObs(e.target.value); setModalError('') }}
                />
              )}
              {modalError && <span className="panel__modal-error">{modalError}</span>}
              <div className="panel__modal-actions">
                <button type="button" onClick={cerrarModal} className="panel__modal-btn panel__modal-btn--cancel">
                  Cancelar
                </button>
                <button type="submit" className="panel__modal-btn panel__modal-btn--submit">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
