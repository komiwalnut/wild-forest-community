import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CalculatorIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/calculator/level');
  }, [router]);

  return null;
}