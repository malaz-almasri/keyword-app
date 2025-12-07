import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Home, PlusCircle, FolderOpen, Globe, Moon, Sun, LogIn, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';

export default function Layout({ children }) {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, login, logout } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/new', label: t('newProject'), icon: PlusCircle },
    { path: '/projects', label: t('projects'), icon: FolderOpen },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-xl">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              NeuroAd
            </span>
          </Link>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full"
              data-testid="language-toggle"
            >
              <Globe className="w-5 h-5" />
            </Button>
            
            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="rounded-full"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={login}
                className="rounded-full gap-2 h-10 px-4"
                data-testid="login-btn"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Bottom Navigation - Mobile */}
      <nav className="sticky bottom-0 z-50 glass border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
                  isActive ? 'text-accent bg-accent/10' : 'text-muted-foreground'
                }`}
                data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed start-4 top-1/2 -translate-y-1/2 z-40">
        <div className="glass rounded-2xl p-2 border border-border space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                  isActive ? 'bg-foreground text-background' : 'text-muted-foreground active:bg-muted'
                }`}
                title={item.label}
                data-testid={`desktop-nav-${item.path.replace('/', '') || 'home'}`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
