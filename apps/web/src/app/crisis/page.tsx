import EnhancedCrisisInterface from '@/components/crisis/EnhancedCrisisInterface';
// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';


export default function CrisisPage() {
  return <EnhancedCrisisInterface />;
}