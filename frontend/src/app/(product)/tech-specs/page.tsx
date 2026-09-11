import { FileText } from 'lucide-react';
import { ComingSoon } from '@/components/ui/primitives';

export default function TechSpecsPage() {
  return (
    <ComingSoon
      title="Tech specs"
      description="RFCs and implementation specs, kept in sync with the code that implements them."
      icon={<FileText className="h-6 w-6" />}
    />
  );
}