import { useState } from 'react'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Users, Shield, Heart } from 'lucide-react'

export const AuthPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const openModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Welcome to Kudos Café</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our sustainable dining community and discover delicious, eco-friendly cuisine
          </p>
        </div>

        {/* Auth Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>New to Kudos Café?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Create an account to track your orders, save favorites, and join our eco-warrior community.
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => openModal('signup')}
              >
                Create Account
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Returning Customer?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Welcome back! Sign in to access your profile, order history, and preferences.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={() => openModal('signin')}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Sustainable Dining</h3>
            <p className="text-sm text-muted-foreground">
              100% organic, locally-sourced ingredients with zero-waste practices
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Community Focused</h3>
            <p className="text-sm text-muted-foreground">
              Join a community of eco-conscious food lovers making a difference
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-10 h-10 bg-sage-green/20 rounded-lg flex items-center justify-center mx-auto">
              <Heart className="w-5 h-5 text-sage-green" />
            </div>
            <h3 className="font-semibold text-foreground">Health & Wellness</h3>
            <p className="text-sm text-muted-foreground">
              Nutritious meals crafted to nourish your body and soul
            </p>
          </div>
        </div>
      </div>

      <AuthModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}

export default AuthPage