'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/AppSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // OPS and AGENTS routes use their own layout/sidebar, don't wrap with AppSidebar
  if (pathname?.startsWith('/ops') || pathname?.startsWith('/agents')) {
    return <>{children}</>;
  }
  
  return <AppSidebar>{children}</AppSidebar>;
}
