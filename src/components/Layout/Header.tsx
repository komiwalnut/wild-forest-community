import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

interface HeaderProps {
  showNav?: boolean;
  navType?: 'lords' | 'calculator' | 'default';
}

export function Header({ showNav = true, navType = 'default' }: HeaderProps) {
  const router = useRouter();
  const { isMobile, isClient } = useDeviceDetection();
  
  const renderNavLinks = () => {
    if (!showNav) return null;
    
    if (navType === 'lords') {
      return (
        <nav className="nav-container">
          <Link href="/lords" legacyBehavior>
            <a className={`nav-link ${router.pathname === '/lords' ? 'active' : ''}`}>
              Lords
            </a>
          </Link>
          <Link href="/owners" legacyBehavior>
            <a className={`nav-link ${router.pathname === '/owners' ? 'active' : ''}`}>
              Owners
            </a>
          </Link>
          {(!isClient || !isMobile) && (
            <Link href="/map" legacyBehavior>
              <a className={`nav-link ${router.pathname === '/map' ? 'active' : ''}`}>
                Map
              </a>
            </Link>
          )}
          <Link href="/raffle" legacyBehavior>
            <a className={`nav-link ${router.pathname === '/raffle' ? 'active' : ''}`}>
              Raffle
            </a>
          </Link>
        </nav>
      );
    } else if (navType === 'calculator') {
      return (
        <nav className="nav-container">
          <Link href="/calculator" legacyBehavior>
            <a className={`nav-link ${router.pathname === '/calculator' ? 'active' : ''}`}>
              Level Up
            </a>
          </Link>
          <Link href="/calculator/rank" legacyBehavior>
            <a className={`nav-link ${router.pathname === '/calculator/rank' ? 'active' : ''}`}>
              Rank Up
            </a>
          </Link>
        </nav>
      );
    } else {
      return (
        <nav className="nav-container">
          <Link href="/lords" legacyBehavior>
            <a className={`nav-link ${router.pathname.startsWith('/lords') || 
                                     router.pathname === '/owners' || 
                                     router.pathname === '/map' || 
                                     router.pathname === '/raffle' ? 'active' : ''}`}>
              Lords Dashboard
            </a>
          </Link>
          <Link href="/calculator" legacyBehavior>
            <a className={`nav-link ${router.pathname.startsWith('/calculator') ? 'active' : ''}`}>
              Unit Calculators
            </a>
          </Link>
        </nav>
      );
    }
  };
  
  return (
    <header className="navbar">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="logo-container">
            <Link href="/" legacyBehavior>
              <a>
                <Image
                  src="/images/logo.png"
                  alt="Wild Forest Logo"
                  width={80}
                  height={44}
                />
              </a>
            </Link>
            {renderNavLinks()}
          </div>
        </div>
      </div>
    </header>
  );
}