import { Rocket } from 'lucide-react';
import { ComingSoon } from '@/components/ui/primitives';

export default function DeploymentPage() {
  return (
    <ComingSoon
      title="Deployment"
      description="Environment tracking, release notes, and deployment health."
      icon={<Rocket className="h-6 w-6" />}
    />
  );
}