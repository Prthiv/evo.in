
import { getDashboardData } from '@/lib/data';
import { StudioPageClient } from '@/components/admin/studio-page-client';

export default async function StudioPage() {
  const dashboardData = await getDashboardData();
  
  return <StudioPageClient dashboardData={dashboardData} />;
}
