import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

interface RestrictedAccessProps {
  children: React.ReactNode;
}

export function RestrictedAccess({ children }: RestrictedAccessProps) {
  const { isMobile, isClient } = useDeviceDetection();
  const router = useRouter();

  useEffect(() => {
    if (isClient && isMobile) {
      router.replace('/restricted');
    }
  }, [isMobile, isClient, router]);

  if (isClient && isMobile) {
    return null;
  }

  return <>{children}</>;
}