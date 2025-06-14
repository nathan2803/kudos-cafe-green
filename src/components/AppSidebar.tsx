import { Home, Menu, Camera, Mail, User, Shield, Utensils, Moon, Sun, LogOut } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useTheme } from '@/components/ThemeProvider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const mainNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Menu",
    url: "/menu", 
    icon: Utensils,
  },
  {
    title: "Gallery",
    url: "/gallery",
    icon: Camera,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: Mail,
  },
]

const userNavItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

const adminNavItems = [
  {
    title: "Admin Panel",
    url: "/admin",
    icon: Shield,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isActive = (url: string) => {
    if (url === '/' && location.pathname === '/') return true
    if (url !== '/' && location.pathname.startsWith(url)) return true
    return false
  }

  return (
    <Sidebar className="border-r border-border/40 bg-card/50 backdrop-blur-md">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <div>
            <h2 className="font-bold text-foreground">Kudos Café</h2>
            <p className="text-xs text-muted-foreground">Sustainable Dining</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`transition-all duration-200 ${
                      isActive(item.url) 
                        ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <button onClick={() => navigate(item.url)} className="w-full flex items-center">
                      <item.icon className={`w-4 h-4 mr-3 ${isActive(item.url) ? 'text-primary' : ''}`} />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-200 ${
                          isActive(item.url) 
                            ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <button onClick={() => navigate(item.url)} className="w-full flex items-center">
                          <item.icon className={`w-4 h-4 mr-3 ${isActive(item.url) ? 'text-primary' : ''}`} />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {isAdmin && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-200 ${
                          isActive(item.url) 
                            ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <button onClick={() => navigate(item.url)} className="w-full flex items-center">
                          <item.icon className={`w-4 h-4 mr-3 ${isActive(item.url) ? 'text-primary' : ''}`} />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 p-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Administrator' : 'Customer'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/profile')}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}