import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Header() {
  const router = useRouter();
  
  return (
    <header className="navbar">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="logo-container">
            <Image
              src="/images/logo.png"
              alt="Wild Forest Logo"
              width={80}
              height={44}
              style={{ objectFit: 'contain' }}
            />
          
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
              <Link href="/map" legacyBehavior>
                <a className={`nav-link ${router.pathname === '/map' ? 'active' : ''}`}>
                  Map
                </a>
              </Link>
              <Link href="/raffle" legacyBehavior>
                <a className={`nav-link ${router.pathname === '/raffle' ? 'active' : ''}`}>
                  Raffle
                </a>
              </Link>
              <Link href="/calculator" legacyBehavior>
                <a className={`nav-link ${router.pathname === '/calculator' ? 'active' : ''}`}>
                  Calculator
                </a>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}