import { createFileRoute } from '@tanstack/react-router';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <PublicLayout>
      {/* Conteúdo da landing — próximo bloco */}
    </PublicLayout>
  );
}
