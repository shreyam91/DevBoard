import { Plug } from 'lucide-react';
import { ComingSoon } from '@/components/ui/primitives';

export default function IntegrationsPage() {
  return (
    <ComingSoon
      title="Integrations"
      description="Connect GitHub, CI, Slack, and more so DevHub can read and act across your whole workflow."
      icon={<Plug className="h-6 w-6" />}
    />
  );
}