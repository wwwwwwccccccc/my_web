import { useEffect, useState } from 'react'

export function useClock() {
  const [time, setTime] = useState('--:--:--')

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const format = () => formatter.format(new Date())

    setTime(format())
    const id = window.setInterval(() => setTime(format()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return time
}
