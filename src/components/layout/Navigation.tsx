'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  description?: string;
  disabled?: boolean;
  external?: boolean;
}

interface NavigationProps {
  className?: string;
  items?: NavItem[];
  transparent?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const defaultNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Products',
    href: '/products',
    children: [
      {
        label: 'All Products',
        href: '/products',
        description: 'Browse our complete catalog',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ),
      },
      {
        label: 'Featured',
        href: '/products/featured',
        description: 'Our top picks for you',
        badge: 'New',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
      },
      {
        label: 'Categories',
        href: '/products/categories',
        description: 'Shop by category',
        icon: (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions',
    children: [
      {
        label: 'For Startups',
        href: '/solutions/startups',
        description: 'Perfect for growing businesses',
      },
      {
        label: 'For Enterprise',
        href: '/solutions/enterprise',
        description: 'Scalable solutions for large teams',
        badge: 'Popular',
      },
      {
        label: 'For Developers',
        href: '/solutions/developers',
        description: 'APIs and developer tools',
      },
    ],
  },
  {
    label: 'Pricing',
    href: '/pricing',
    badge: 'Pro',
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export function Navigation({ 
  className,
  items = defaultNavItems,
  transparent = false,
  orientation = 'horizontal'
}: NavigationProps) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleMouseEnter = (label: string) => {
    if (orientation === 'horizontal') {
      setActiveDropdown(label);
    }
  };

  const handleMouseLeave = () => {
    if (orientation === 'horizontal') {
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (label: string) => {
    if (orientation === 'vertical') {
      setActiveDropdown(activeDropdown === label ? null : label);
    }
  };

  return (
    <nav className={cn(
      orientation === 'horizontal' ? 'flex items-center space-x-1' : 'flex flex-col space-y-1',
      className
    )}>
      {items.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => handleMouseEnter(item.label)}
          onMouseLeave={handleMouseLeave}
        >
          {item.href && !item.children ? (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? transparent
                    ? "bg-white/10 text-white"
                    : "bg-accent text-accent-foreground"
                  : transparent
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "cursor-not-allowed opacity-50"
              )}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" size="sm">
                  {item.badge}
                </Badge>
              )}
              {item.external && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </Link>
          ) : (
            <button
              onClick={() => toggleDropdown(item.label)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                transparent
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "cursor-not-allowed opacity-50",
                activeDropdown === item.label && (transparent ? "bg-white/10 text-white" : "bg-accent")
              )}
              disabled={item.disabled}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" size="sm">
                  {item.badge}
                </Badge>
              )}
              {item.children && (
                <svg
                  className={cn(
                    "h-4 w-4 transition-transform",
                    activeDropdown === item.label && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          )}

          {/* Dropdown Menu */}
          {item.children && activeDropdown === item.label && (
            <div
              className={cn(
                "z-50 min-w-[200px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md",
                orientation === 'horizontal' 
                  ? "absolute left-0 top-full mt-1" 
                  : "mt-1 ml-4"
              )}
            >
              {item.children.map((child) => (
                <Link
                  key={child.label}
                  href={child.href || '#'}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    child.disabled && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => setActiveDropdown(null)}
                >
                  {child.icon && (
                    <span className="mt-0.5 text-muted-foreground">
                      {child.icon}
                    </span>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{child.label}</span>
                      {child.badge && (
                        <Badge variant="secondary" size="sm">
                          {child.badge}
                        </Badge>
                      )}
                    </div>
                    {child.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {child.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}