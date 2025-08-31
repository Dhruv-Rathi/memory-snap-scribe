import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, BookOpen, Share2, Home } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/camera', icon: Camera, label: 'Camera' },
    { path: '/scrapebook', icon: BookOpen, label: 'Scrapebook' },
    { path: '/share', icon: Share2, label: 'Share' }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 ${
                  isActive 
                    ? 'text-primary scale-110' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}