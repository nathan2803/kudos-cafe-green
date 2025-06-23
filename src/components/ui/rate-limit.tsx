
import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock } from 'lucide-react'

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

export const useRateLimit = (key: string, config: RateLimitConfig) => {
  const [isBlocked, setIsBlocked] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  const checkRateLimit = (): boolean => {
    const now = Date.now()
    const storageKey = `rate_limit_${key}`
    const data = localStorage.getItem(storageKey)
    
    let attempts: number[] = []
    if (data) {
      try {
        const parsed = JSON.parse(data)
        attempts = parsed.attempts || []
        
        // Check if still blocked
        if (parsed.blockedUntil && now < parsed.blockedUntil) {
          setIsBlocked(true)
          setRemainingTime(Math.ceil((parsed.blockedUntil - now) / 1000))
          return false
        }
      } catch (e) {
        // Invalid data, reset
        localStorage.removeItem(storageKey)
      }
    }

    // Remove old attempts outside the window
    attempts = attempts.filter(timestamp => now - timestamp < config.windowMs)

    // Check if limit exceeded
    if (attempts.length >= config.maxAttempts) {
      const blockedUntil = now + config.blockDurationMs
      localStorage.setItem(storageKey, JSON.stringify({
        attempts,
        blockedUntil
      }))
      setIsBlocked(true)
      setRemainingTime(Math.ceil(config.blockDurationMs / 1000))
      return false
    }

    // Add current attempt
    attempts.push(now)
    localStorage.setItem(storageKey, JSON.stringify({ attempts }))
    setIsBlocked(false)
    return true
  }

  useEffect(() => {
    if (isBlocked && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setIsBlocked(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isBlocked, remainingTime])

  return { isBlocked, remainingTime, checkRateLimit }
}

export const RateLimitAlert = ({ remainingTime }: { remainingTime: number }) => {
  const minutes = Math.floor(remainingTime / 60)
  const seconds = remainingTime % 60

  return (
    <Alert variant="destructive">
      <Clock className="h-4 w-4" />
      <AlertDescription>
        Too many attempts. Please try again in {minutes > 0 ? `${minutes}m ` : ''}{seconds}s.
      </AlertDescription>
    </Alert>
  )
}
