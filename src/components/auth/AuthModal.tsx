import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Leaf, Mail, Lock, User, Phone } from 'lucide-react'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
}

export const AuthModal = ({ open, onClose, mode, onModeChange }: AuthModalProps) => {
  const { signIn, signUp, resetPassword } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    
    if (!formData.password && !resetMode) {
      setError('Password is required')
      return false
    }

    if (mode === 'signup') {
      if (!formData.fullName) {
        setError('Full name is required')
        return false
      }
      
      if (!formData.phone) {
        setError('Phone number is required')
        return false
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      if (resetMode) {
        await resetPassword(formData.email)
        toast({
          title: "Reset link sent",
          description: "Check your email for password reset instructions.",
        })
        setResetMode(false)
      } else if (mode === 'signin') {
        await signIn(formData.email, formData.password)
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        onClose()
      } else {
        await signUp(formData.email, formData.password, formData.fullName, formData.phone)
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: ''
    })
    setError('')
    setResetMode(false)
    setShowPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const switchMode = (newMode: 'signin' | 'signup') => {
    resetForm()
    onModeChange(newMode)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {resetMode 
              ? 'Reset Password' 
              : mode === 'signin' 
                ? 'Welcome back' 
                : 'Join Kudos Cafe'
            }
          </DialogTitle>
          {!resetMode && (
            <p className="text-sm text-muted-foreground text-center">
              {mode === 'signin' 
                ? 'Sign in to your account to continue' 
                : 'Create an account to start your green dining journey'
              }
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Full Name Field (Sign Up Only) */}
          {mode === 'signup' && !resetMode && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Phone Field (Sign Up Only) */}
          {mode === 'signup' && !resetMode && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          {!resetMode && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Confirm Password Field (Sign Up Only) */}
          {mode === 'signup' && !resetMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Remember Me (Sign In Only) */}
          {mode === 'signin' && !resetMode && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">Remember me</Label>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90" 
            disabled={loading}
          >
            {loading ? 'Loading...' : resetMode ? 'Send Reset Link' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Forgot Password Link */}
          {mode === 'signin' && !resetMode && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-primary"
                onClick={() => setResetMode(true)}
              >
                Forgot your password?
              </Button>
            </div>
          )}

          {/* Mode Switch */}
          {!resetMode && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                type="button"
                variant="link"
                className="text-primary"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                {mode === 'signin' ? 'Sign up here' : 'Sign in here'}
              </Button>
            </div>
          )}

          {/* Back to Sign In (Reset Mode) */}
          {resetMode && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-primary"
                onClick={() => setResetMode(false)}
              >
                Back to sign in
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}