
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Leaf, Mail, Lock, User, Phone } from 'lucide-react'
import { 
  signInSchema, 
  signUpSchema, 
  sanitizeInput,
  type SignInFormData,
  type SignUpFormData 
} from '@/utils/validation'
import { EnhancedInput } from '@/components/ui/enhanced-input'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { ProgressIndicator } from '@/components/ui/progress-indicator'

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

  const signUpSteps = ['Account Info', 'Personal Details', 'Security']
  const currentStep = mode === 'signup' ? 1 : 0

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

        {mode === 'signup' && !resetMode && (
          <ProgressIndicator 
            steps={signUpSteps} 
            currentStep={currentStep} 
            className="mb-4" 
          />
        )}

        {mode === 'signin' ? (
          <form onSubmit={signInForm.handleSubmit(handleSubmit)} className="space-y-4">
            <EnhancedInput
              {...signInForm.register('email')}
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail className="h-4 w-4" />}
              error={signInForm.formState.errors.email?.message}
              disabled={loading}
            />

            {!resetMode && (
              <EnhancedInput
                {...signInForm.register('password')}
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                error={signInForm.formState.errors.password?.message}
                disabled={loading}
              />
            )}

            {!resetMode && (
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

            <EnhancedButton 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              loading={loading}
              loadingText={resetMode ? 'Sending...' : 'Signing in...'}
              tooltip={resetMode ? 'Send password reset email' : 'Sign in to your account'}
            >
              {resetMode ? 'Send Reset Link' : 'Sign In'}
            </EnhancedButton>

            {!resetMode && (
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

            {!resetMode && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="text-primary"
                  onClick={() => switchMode('signup')}
                  disabled={loading}
                >
                  Sign up here
                </Button>
              </div>
            )}

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
        ) : (
          <form onSubmit={signUpForm.handleSubmit(handleSubmit)} className="space-y-4">
            <EnhancedInput
              {...signUpForm.register('email')}
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail className="h-4 w-4" />}
              error={signUpForm.formState.errors.email?.message}
              disabled={loading}
            />

            <EnhancedInput
              {...signUpForm.register('fullName')}
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              icon={<User className="h-4 w-4" />}
              error={signUpForm.formState.errors.fullName?.message}
              disabled={loading}
            />

            <EnhancedInput
              {...signUpForm.register('phone')}
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              icon={<Phone className="h-4 w-4" />}
              error={signUpForm.formState.errors.phone?.message}
              disabled={loading}
            />

            <EnhancedInput
              {...signUpForm.register('password')}
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              error={signUpForm.formState.errors.password?.message}
              hint="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
              disabled={loading}
            />

            <EnhancedInput
              {...signUpForm.register('confirmPassword')}
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={<Lock className="h-4 w-4" />}
              error={signUpForm.formState.errors.confirmPassword?.message}
              disabled={loading}
            />

            <EnhancedButton 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              loading={loading}
              loadingText="Creating account..."
              tooltip="Create your Kudos Cafe account"
            >
              Create Account
            </EnhancedButton>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?
              </p>
              <Button
                type="button"
                variant="link"
                className="text-primary"
                onClick={() => switchMode('signin')}
                disabled={loading}
              >
                Sign in here
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
