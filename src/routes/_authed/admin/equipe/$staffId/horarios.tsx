// src/routes/_authed/admin/equipe/$staffId/horarios.tsx
import { createFileRoute } from '@tanstack/react-router';
import { CalendarRange } from 'lucide-react';
import {
  staffWorkingHoursQuery,
  WorkingHoursEditor,
  buildDefaultWorkingHours,
  StaffTimeOffManager,
} from '@/features/staff';

export const Route = createFileRoute(
  '/_authed/admin/equipe/$staffId/horarios',
)({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      staffWorkingHoursQuery(params.staffId),
    );
  },
  component: HorariosPage,
});

function HorariosPage() {
  const data = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 xl:max-w-6xl">
      {/* Header da página */}
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span
            className="shrink-0 rounded-xl p-2"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--color-accent) 14%, transparent)',
              color: 'var(--color-accent-bright)',
              boxShadow:
                'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 25%, transparent)',
            }}
          >
            <CalendarRange className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1
              className="text-lg font-semibold leading-none tracking-tight"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text-heading)',
              }}
            >
              Disponibilidade
            </h1>
            {data.fullName && (
              <p
                className="mt-1 truncate text-base font-bold leading-tight tracking-tight"
                style={{ color: 'var(--color-accent-bright)' }}
              >
                {data.fullName}
              </p>
            )}

          </div>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Defina a <strong style={{ color: 'var(--color-text-heading)' }}>grade
          semanal fixa</strong> de trabalho e cadastre{' '}
          <strong style={{ color: 'var(--color-text-heading)' }}>folgas
          pontuais</strong> em datas específicas.
        </p>
      </header>

      {/* Grid das seções: empilhado no mobile, 2 colunas no xl */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[3fr_2fr] xl:items-start xl:gap-6">
        {/* Seção 1 — Recorrente */}
        <section className="order-2 space-y-3 xl:order-1">
          <SectionLabel
            title="Horário de trabalho"
            hint="Repete toda semana"
          />
          <WorkingHoursEditor
            staffId={data.staffId}
            initial={data.workingHours ?? buildDefaultWorkingHours()}
            canEdit={data.canEdit}
          />
        </section>

        {/* Seção 2 — Pontual */}
        <section className="order-1 space-y-3 xl:order-2">
          <SectionLabel
            title="Folgas e bloqueios"
            hint="Datas específicas (exceções)"
          />
          <StaffTimeOffManager staffId={data.staffId} canEdit={data.canEdit} />
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span
        className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--color-accent-bright)' }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className="h-px flex-1"
        style={{
          background:
            'linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 30%, transparent), transparent)',
        }}
      />
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {hint}
      </span>
    </div>
  );
}
