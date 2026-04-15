import { useState } from 'react'
import './Hero.css'

const empleados = [
  "Yamila P.",
  "Milagros S.",
  "Matias S."
]

const ROLES = [
  'Administración',
  'Asesor',
  'Supervisor',
  'Limpieza',
  'Recursos Humanos',
  'Gerencia',
  'Otro',
]

export default function Hero() {
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('')
  const [tipo, setTipo] = useState('ingreso') // 'ingreso' | 'egreso'
  const [feedback, setFeedback] = useState(null) // { msg, ok }

  const getHora = () => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nombreTrim = nombre.trim()
    if (!nombreTrim || !rol) {
      setFeedback({ msg: 'Completá nombre y rol antes de registrar.', ok: false })
      return
    }

    const hora = getHora()
    const registro = {
      id: Date.now(),
      nombre: nombreTrim,
      rol,
      tipo,         // 'ingreso' | 'egreso'
      hora,
      fecha: new Date().toLocaleDateString('es-AR'),
    }

    // Guardar en localStorage
    const clave = `registros_${new Date().toISOString().slice(0, 10)}`
    const existentes = JSON.parse(localStorage.getItem(clave) || '[]')
    existentes.push(registro)
    localStorage.setItem(clave, JSON.stringify(existentes))

    // Emitir evento para que el Panel se actualice
    window.dispatchEvent(new Event('registros-updated'))

    const accion = tipo === 'ingreso' ? 'ingresó' : 'egresó'
    setFeedback({ msg: `✅ ${nombreTrim} (${rol}) ${accion} a las ${hora}hs`, ok: true })
    setNombre('')
    setRol('')

    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <section className="hero" id="interno">
      <div className="hero__container">

        <div className="hero__header">
          <span className="hero__badge">Control de Personal</span>
          <h1 className="hero__title">Registro de Ingreso / Egreso</h1>
          <p className="hero__subtitle">
            Completá los datos y registrá el movimiento del personal.
          </p>
        </div>

        <form className="hero__form" onSubmit={handleSubmit} noValidate>

          {/* Nombre */}
          <div className="hero__field">
            <label htmlFor="nombre" className="hero__label">
              <span className="hero__label-icon">👤</span>
              Nombre y Apellido
            </label>
           <select
              id="nombre"
              className="hero__input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            >
              <option value="">- Seleccionar empleado -</option>

              {empleados.map((emp, i) => (
                <option key={i} value={emp}>
                  {emp}
                </option>
              ))}
            </select>

          </div>

          {/* Rol */}
          <div className="hero__field">
            <label htmlFor="rol" className="hero__label">
              <span className="hero__label-icon">🏷️</span>
              Rol / Área
            </label>
            <select
              id="rol"
              className="hero__select"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="">— Seleccioná un rol —</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Tipo: Ingreso / Egreso */}
          <div className="hero__field">
            <span className="hero__label">
              <span className="hero__label-icon">⏱️</span>
              Tipo de Movimiento
            </span>
            <div className="hero__toggle">
              <button
                type="button"
                id="btn-ingreso"
                className={`hero__toggle-btn${tipo === 'ingreso' ? ' hero__toggle-btn--active-in' : ''}`}
                onClick={() => setTipo('ingreso')}
              >
                <span>↗</span> Ingreso
              </button>
              <button
                type="button"
                id="btn-egreso"
                className={`hero__toggle-btn${tipo === 'egreso' ? ' hero__toggle-btn--active-out' : ''}`}
                onClick={() => setTipo('egreso')}
              >
                <span>↙</span> Egreso
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="btn-registrar"
            type="submit"
            className={`hero__submit hero__submit--${tipo}`}
          >
            {tipo === 'ingreso' ? '↗ Registrar Ingreso' : '↙ Registrar Egreso'}
          </button>

        </form>

        {/* Feedback */}
        {feedback && (
          <div className={`hero__feedback hero__feedback--${feedback.ok ? 'ok' : 'error'}`}>
            {feedback.msg}
          </div>
        )}

      </div>
    </section>
  )
}
