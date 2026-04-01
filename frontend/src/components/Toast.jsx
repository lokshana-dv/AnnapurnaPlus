// Simple Toast notification system
import { useState, useEffect } from 'react'

let toastFn = null

export const toast = {
  success: (msg) => toastFn?.('success', msg),
  error:   (msg) => toastFn?.('error', msg),
  info:    (msg) => toastFn?.('info', msg),
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = (type, message) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, type, message }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }
    return () => { toastFn = null }
  }, [])

  const colors = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
  }

  const icons = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️',
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id}
          className={`${colors[t.type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-bounce`}>
          <span>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export default toast