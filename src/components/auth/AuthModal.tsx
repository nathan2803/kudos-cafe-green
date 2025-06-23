
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Leaf, Mail, Lock, User, Phone } from 'lucide-react'
import { 
  signInSchema, 
  signUpSchema, 
  sanitizeInput,
  type SignInFormData,
  type SignUpFormData 
} from '@/utils/validation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

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
  const [resetMode, setResetMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: ''
    }
  })

  const currentForm = mode === 'signin' ? signInForm : signUpForm

  const handleSubmit = async (data: SignInFormData | SignUpFormData) => {
    setLoading(true)

    try {
      if (resetMode) {
        await resetPassword(sanitizeInput(data.email))
        toast({
          title: "Reset link sent",
          description: "Check your email for password reset instructions.",
        })
        setResetMode(false)
      } else if (mode === 'signin') {
        const signInData = data as SignInFormData
        await signIn(sanitizeInput(signInData.email), signInData.password)
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        onClose()
      } else {
        const signUpData = data as SignUpFormData
        await signUp(
          sanitizeInput(signUpData.email), 
          signUpData.password, 
          sanitizeInput(signUpData.fullName), 
          sanitizeInput(signUpData.phone || '')
        )
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })
        onClose()
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || 'An error occurred',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    signInForm.reset()
    signUpForm.reset()
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

        <form onSubmit={currentForm.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                {...currentForm.register('email')}
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                disabled={loading}
              />
            </div>
            {currentForm.formState.errors.email && (
              <p className="text-sm text-destructive">{currentForm.formState.errors.email.message}</p>
            )}
          </div>

          {/* Full Name Field (Sign Up Only) */}
          {mode === 'signup' && !resetMode && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  {...signUpForm.register('fullName')}
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {signUpForm.formState.errors.fullName && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.fullName.message}</p>
              )}
            </div>
          )}

          {/* Phone Field (Sign Up Only) */}
          {mode === 'signup' && !resetMode && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  {...signUpForm.register('phone')}
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {signUpForm.formState.errors.phone && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.phone.message}</p>
              )}
            </div>
          )}

          {/* Password Field */}
          {!resetMode && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  {...currentForm.register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {currentForm.formState.errors.password && (
                <p className="text-sm text-destructive">{currentForm.formState.errors.password.message}</p>
              )}
            </div>
          )}

          {/* Confirm Password Field (Sign Up Only) */}
          {mode === 'signup' && !resetMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  {...signUpForm.register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          {/* Remember Me (Sign In Only) */}
          {mode === 'signin' && !resetMode && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
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
            {loading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
