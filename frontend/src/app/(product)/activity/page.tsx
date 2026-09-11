import { Activity } from 'lucide-react';
import { ComingSoon } from '@/components/ui/primitives';

export default function ActivityPage() {
  return (
    <ComingSoon
      title="Activity"
      description="A live, filterable feed of every event DevHub tracks across your workspace."
      icon={<Activity className="h-6 w-6" />}
    />
  );
}