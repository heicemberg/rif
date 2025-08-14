'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MobileMenu } from './MobileMenu';
import { Navigation } from './Navigation';

interface HeaderProps {
  className?: string;
  transparent?: boolean;
  sticky?: boolean;
}

export function Header({ 
  className, 
  transparent = false,
  sticky = true 
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isTransparent = transparent && !isScrolled && !isMobileMenuOpen;

  return (
    <>
      <header
        className={cn(
          'top-0 z-40 w-full transition-all duration-300',
          sticky && 'sticky',
          isTransparent
            ? 'bg-transparent text-white'
            : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
          isScrolled && sticky && 'shadow-sm',
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 transition-transform hover:scale-105"
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600",
                  isTransparent && "from-white/90 to-white/70"
                )}>
                  <span className={cn(
                    "text-sm font-bold",
                    isTransparent ? "text-black" : "text-white"
                  )}>
                    A
                  </span>
                </div>
                <span className="text-xl font-bold">
                  AppName
                </span>
              </Link>

              {/* Desktop Navigation */}
              <Navigation className="hidden lg:flex" transparent={isTransparent} />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Search Button - Desktop */}
              <button
                className={cn(
                  "hidden md:flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  isTransparent 
                    ? "hover:bg-white/10" 
                    : "hover:bg-accent"
                )}
                aria-label="Search"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Notifications - Desktop */}
              <button
                className={cn(
                  "relative hidden md:flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  isTransparent 
                    ? "hover:bg-white/10" 
                    : "hover:bg-accent"
                )}
                aria-label="Notifications"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              </button>

              {/* Theme Toggle - Desktop */}
              <button
                className={cn(
                  "hidden md:flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  isTransparent 
                    ? "hover:bg-white/10" 
                    : "hover:bg-accent"
                )}
                aria-label="Toggle theme"
              >
                <svg
                  className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <svg
                  className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </button>

              {/* CTA Buttons - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant={isTransparent ? "ghost" : "ghost"}
                  size="sm"
                  className={isTransparent ? "text-white hover:text-white/80" : ""}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  variant={isTransparent ? "outline" : "default"}
                  className={isTransparent ? "border-white text-white hover:bg-white hover:text-black" : ""}
                >
                  Get Started
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "lg:hidden relative h-9 w-9 rounded-lg transition-colors",
                  isTransparent 
                    ? "hover:bg-white/10" 
                    : "hover:bg-accent"
                )}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Toggle menu</span>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span
                    className={cn(
                      "absolute block h-0.5 w-5 transform bg-current transition-all duration-300",
                      isMobileMenuOpen ? "rotate-45" : "-translate-y-1.5"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute block h-0.5 w-5 transform bg-current transition-all duration-300",
                      isMobileMenuOpen && "scale-0"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute block h-0.5 w-5 transform bg-current transition-all duration-300",
                      isMobileMenuOpen ? "-rotate-45" : "translate-y-1.5"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar (optional) */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300" 
          style={{ width: '0%' }} 
        />
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Spacer for transparent header */}
      {transparent && !sticky && (
        <div className="h-16" />
      )}
    </>
  );
}