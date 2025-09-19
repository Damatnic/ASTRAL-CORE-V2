import CrisisInterventionDashboard from '@/components/crisis/CrisisInterventionDashboard';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


export default function CrisisDashboardPage() {
  return <CrisisInterventionDashboard />;
}