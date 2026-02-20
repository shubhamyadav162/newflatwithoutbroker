import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Menu, X, Building2, Building, LandPlot, Users, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Rent', href: '/listings?listingType=RENT', icon: Building2 },
  { name: 'Buy', href: '/listings?listingType=SELL', icon: Building },
  { name: 'Commercial', href: '/listings?type=OFFICE', icon: LandPlot },
  { name: 'PG/Hostel', href: '/listings?type=PG', icon: Users },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'glass shadow-soft py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-cherry">
                  <Home className="w-5 h-5 text-primary-foreground" />
                </div>
              </motion.div>
              <span className="font-heading font-bold text-lg md:text-xl text-secondary">
                FlatWithout<span className="text-gradient-cherry">Brokerage</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full font-medium text-sm transition-all duration-200',
                    'hover:bg-muted hover:text-secondary',
                    location.pathname === link.href
                      ? 'bg-muted text-secondary'
                      : 'text-muted-foreground'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link to="/post-property">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="animate-glow-pulse rounded-full"
                >
                  <Button className="btn-cherry hidden sm:flex">
                    <span>Post Property (Free)</span>
                  </Button>
                </motion.div>
              </Link>

              {/* Auth Section */}
              {!isLoading && (
                <>
                  {isAuthenticated && user ? (
                    /* User Menu - Logged In */
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted transition-colors"
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <span className="hidden md:inline font-medium text-sm">{user.name}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </motion.button>

                      {/* User Dropdown */}
                      <AnimatePresence>
                        {isUserMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-elevated border border-border py-2"
                          >
                            <div className="px-4 py-2 border-b border-border">
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <Link
                              to="/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span className="text-sm">My Profile</span>
                            </Link>
                            <Link
                              to="/my-properties"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                            >
                              <Building className="w-4 h-4" />
                              <span className="text-sm">My Properties</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Logout</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Login Button - Not Logged In */
                    <Link to="/login">
                      <Button variant="outline" className="rounded-full hidden sm:flex border-accent hover:bg-accent hover:text-accent-foreground">
                        Login / Sign Up
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-card shadow-elevated z-40 lg:hidden"
          >
            <div className="flex flex-col h-full pt-24 px-6 pb-8">
              <nav className="flex-1 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium hover:bg-muted transition-colors"
                    >
                      <link.icon className="w-5 h-5 text-primary" />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-3 pt-6 border-t border-border">
                <Link to="/post-property" className="block">
                  <Button className="btn-cherry w-full">
                    <span>Post Property (Free)</span>
                  </Button>
                </Link>

                {!isLoading && (
                  isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 bg-muted rounded-lg">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" className="block">
                      <Button variant="outline" className="w-full rounded-full border-accent">
                        Login / Sign Up
                      </Button>
                    </Link>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
