import TetherConnection from '@/components/tether/TetherConnection';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

export default function TetherPage() {
  return <TetherConnection />;
}