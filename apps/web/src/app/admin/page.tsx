import AdminAnalyticsDashboard from '@/components/dashboard/AdminAnalyticsDashboard';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


export default function AdminDashboard() {
  return <AdminAnalyticsDashboard />;
}