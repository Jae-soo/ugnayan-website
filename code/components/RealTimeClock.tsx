'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function RealTimeClock(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const formatTime = (date: Date): string => {
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    const secondsStr = seconds < 10 ? '0' + seconds : seconds
    
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`
  }

  return (
    <div className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg shadow-md">
      <Clock className="h-4 w-4" />
      <div className="text-right">
        <div className="text-xs font-medium">{formatDate(currentTime)}</div>
        <div className="text-sm font-bold">{formatTime(currentTime)}</div>
      </div>
    </div>
  )
}
