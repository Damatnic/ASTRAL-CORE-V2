import SafetyPlanGenerator from '@/components/crisis/SafetyPlanGenerator';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


export default function SafetyPlanPage() {
  return <SafetyPlanGenerator />;
}