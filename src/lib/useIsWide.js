import { useState, useEffect } from 'react'

// Vero per schermi più larghi di un telefono (desktop/tablet). Usa il vero
// viewport del browser/dispositivo, non la colonna da 430px in cui è
// disegnata l'app.
export default function useIsWide(breakpoint = 768) {
  const [isWide, setIsWide] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= breakpoint
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const handler = (e) => setIsWide(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isWide
}