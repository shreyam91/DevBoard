import { CircleDot } from 'lucide-react';
import { ComingSoon } from '@/components/ui/primitives';

export default function IssuesPage() {
  return (
    <ComingSoon
      title="Issues"
      description="Issue tracking, triage, and AI grouping across your repositories."
      icon={<CircleDot className="h-6 w-6" />}
    />
  );
}