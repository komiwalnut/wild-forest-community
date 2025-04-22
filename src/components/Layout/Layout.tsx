import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  navType?: 'lords' | 'calculator' | 'default';
}

export function Layout({ children, showNav = true, navType = 'default' }: LayoutProps) {
  return (
    <div className="layout">
      <Header showNav={showNav} navType={navType} />
      <main className="main-content">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}