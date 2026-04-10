import { useState, useEffect } from 'react'
import './Historial.css'

export default function Historial() {
  const [registros, setRegistros] = useState([])
  const [filtro, setFiltro] = useState('')
  const [esOculto, setEsOculto] = useState(true)

  // Estados del Modal
  const [modal, setModal] = useState(null)
  const [pin, setPin] = useState('')
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    // Cargar todos los históricos
    let todos = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('historico_')) {
        try {
          const datos = JSON.parse(localStorage.getItem(key))
          if (Array.isArray(datos)) {
            todos = todos.concat(datos)
          }
        } catch (e) {
          console.error("Error leyendo historico", e)
        }
      }
    }
    // Ordenar de más reciente a más antiguo
    todos.sort((a, b) => b.id - a.id)
    setRegistros(todos)
  }, [])

  useEffect(() => {
    const handleGlobalSearch = (e) => setFiltro(e.detail)
    window.addEventListener('global-search', handleGlobalSearch)
    return () => window.removeEventListener('global-search', handleGlobalSearch)
  }, [])

  const accionarConClave = (onSuccess) => {
    const claveGuardada = localStorage.getItem('admin_password')
    if (!claveGuardada) {
      setModal({
        titulo: "Acceso Denegado",
        desc: "Aún no tienes clave maestra. Ve a la 'Planilla Diaria' para crear tu primera clave.",
        soloAviso: true,
        onConfirm: () => true
      })
      return
    }

    setModal({
      titulo: "Verificar Identidad",
      desc: "Ingresá tu clave maestra para ver el historial.",
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

  const handleTogglePrivacidad = () => {
    if (esOculto) {
      accionarConClave(() => setEsOculto(false))
    } else {
      setEsOculto(true)
    }
  }

  const handleGenerarRecorte = () => {
    if (registros.length === 0) {
      alert('No hay registros en el historial.')
      return
    }
    accionarConClave(() => {
      let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
      html += '<head><meta charset="utf-8"></head><body>';
      html += '<table border="1">';
      html += '<tr style="background-color: #f1f1f1"><th>Fecha</th><th>Hora</th><th>Movimiento</th><th>Nombre y Apellido</th><th>Rol</th><th>Observaciones</th></tr>';
      
      registros.forEach(r => {
        let mov = r.tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
        if (r.eliminado) mov = mov + ' (Tachado/Cancelado)';
        let obs = r.eliminado ? r.observacion : '';
        let rowStyle = r.eliminado ? 'color: red; text-decoration: line-through;' : '';
        
        html += `<tr style="${rowStyle}">`;
        html += `<td>${r.fecha}</td><td>${r.hora}</td><td>${mov}</td><td>${r.nombre}</td><td>${r.rol}</td><td>${obs}</td>`;
        html += `</tr>`;
      });
      
      html += '</table></body></html>';

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Historial_Auditoria_${Date.now()}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    })
  }

  const cerrarModal = () => {
    setModal(null)
    setPin('')
    setModalError('')
  }

  const handleModalSubmit = (e) => {
    e.preventDefault()
    if (modal.soloAviso) {
      cerrarModal()
      return
    }
    if (!pin.trim()) {
      setModalError("La clave no puede estar vacía.")
      return
    }
    const success = modal.onConfirm(pin)
    if (success) cerrarModal()
  }

  return (
    <section className="historial" id="historial">
      <div className="historial__container">
        
        <div className="historial__header">
          <div>
            <span className="historial__badge">Restringido</span>
            <h2 className="historial__title">Historial General</h2>
            <p className="historial__date">Aquí se guardan todos los datos archivados.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
             <button
              className="historial__action-btn"
              onClick={handleTogglePrivacidad}
              title="Mostrar/Ocultar datos sensibles"
             >
                {esOculto ? '🔒 Desbloquear Todo' : '🔓 Bloquear'}
             </button>
             <button
              className="historial__action-btn historial__action-btn--primary"
              onClick={handleGenerarRecorte}
              title="Descargar base de datos total"
             >
                📥 Exportar Todo
             </button>
          </div>
        </div>

        {registros.length === 0 ? (
          <div className="historial__empty">
            <span className="historial__empty-icon">📭</span>
            <p>Todavía no hay planillas archivadas.</p>
          </div>
        ) : (
          <div className="historial__table-wrap">
            <table className="historial__table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>No</th>
                  <th>Nombre y Apellido</th>
                  <th>Rol / Área</th>
                  <th>Movimiento</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const q = filtro.toLowerCase()
                  const registrosFiltrados = registros.filter(r => {
                    const matchNombre = !esOculto && r.nombre.toLowerCase().includes(q)
                    return matchNombre ||
                      r.rol.toLowerCase().includes(q) ||
                      r.tipo.toLowerCase().includes(q) ||
                      r.fecha.toLowerCase().includes(q)
                  })
                  return registrosFiltrados.map((r, idx) => (
                  <tr key={`${r.id}-${idx}`} className={`historial__row historial__row--${r.eliminado ? 'eliminado' : r.tipo}`}>
                    <td className="historial__row-fecha">{r.fecha}</td>
                    <td className="historial__row-hora">
                      <span className="historial__hora-chip">{r.hora}</span>
                    </td>
                    <td className="historial__row-num">{registros.length - idx}</td>
                    <td className="historial__row-nombre">
                      {esOculto ? '••••••••••••' : r.nombre}
                      {r.eliminado && !esOculto && (
                        <span className="historial__obs">Justificación: {r.observacion}</span>
                      )}
                    </td>
                    <td>
                      <span className="historial__row-rol">{r.rol}</span>
                    </td>
                    <td>
                      {esOculto ? (
                        <span className="historial__badge-tipo historial__badge-tipo--hidden">
                          🔒 Oculto
                        </span>
                      ) : (
                        <span className={`historial__badge-tipo historial__badge-tipo--${r.eliminado ? 'eliminado' : r.tipo}`}>
                          {r.tipo === 'ingreso' ? '↗ ingresó' : '↙ egresó'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
                })()}
              </tbody>
            </table>
          </div>
        )}

      </div>
      
      {/* Security Modal */}
      {modal && (
        <div className="panel__modal-overlay" onClick={cerrarModal}>
          <div className="panel__modal" onClick={e => e.stopPropagation()}>
            <h3 className="panel__modal-title">🔐 {modal.titulo}</h3>
            <p className="panel__modal-desc">{modal.desc}</p>
            <form onSubmit={handleModalSubmit}>
              {!modal.soloAviso && (
                <input
                  type="password"
                  className={`panel__modal-input ${modalError ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setModalError('') }}
                  autoFocus
                />
              )}
              {modalError && <span className="panel__modal-error">{modalError}</span>}
              <div className="panel__modal-actions">
                <button type="button" onClick={cerrarModal} className="panel__modal-btn panel__modal-btn--cancel">
                  {modal.soloAviso ? 'Entendido' : 'Cancelar'}
                </button>
                {!modal.soloAviso && (
                  <button type="submit" className="panel__modal-btn panel__modal-btn--submit">
                    Confirmar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
