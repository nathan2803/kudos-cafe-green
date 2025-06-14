import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { ThemeProvider } from '@/components/ThemeProvider'

// Pages
import Landing from "./pages/Landing";
import Gallery from "./pages/Gallery";
import Menu from "./pages/Menu";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="kudos-cafe-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <main className="flex-1 overflow-hidden">
                <div className="flex flex-col h-screen">
                  <div className="flex items-center p-4 border-b border-border/40 bg-card/50 backdrop-blur-sm">
                    <SidebarTrigger className="mr-4" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">K</span>
                      </div>
                      <span className="font-semibold text-foreground">Kudos Café</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
