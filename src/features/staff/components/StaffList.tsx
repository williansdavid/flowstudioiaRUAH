// src/features/staff/components/StaffList.tsx
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Pencil,
  Plus,
  Mail,
  Phone,
  CalendarCheck2,
  CalendarX2,
  CalendarRange,
  AlertCircle,
  Users,
  Send,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import { toast } from 'sonner';
import { staffColor } from '../../appointments/components/DayCalendar/staffColor';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';
import { useStaffList, useResendStaffInvite, useArchiveStaff } from '../hooks';
import type { StaffListItem } from '../types';
import { Button } from '@/components/ui/Button';

interface StaffListProps {
  onCreate?: () => void;
  onEdit?: (id: string) => void;
}

/** Iniciais do nome para fallback do avatar. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/** Formata telefone BR (simples, sem lib externa). */
function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

function Avatar({
  name,
  url,
  color,
}: {
  name: string;
  url: string | null;
  color: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(url) && !failed;

  return (
    <div
      className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {showImg ? (
        <img
          src={url as string}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-base font-semibold" style={{ color }}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

function CreateButton({ onCreate }: { onCreate?: () => void }) {
  if (!onCreate) return null;
  return (
    <Button type="button" variant="primary" size="md" onClick={onCreate}>
      <Plus className="size-4" />
      Novo profissional
    </Button>
  );
}

/** Skeleton de um card durante o loading. */
function StaffCardSkeleton() {
  return (
    <li className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="size-14 shrink-0 animate-pulse rounded-full bg-surface-2" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-surface-2" />
        </div>
      </div>
      <div className="space-y-2 border-t border-border pt-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
    </li>
  );
}

function StaffCard({
  staff,
  onEdit,
  onArchive,
  archivePending,
}: {
  staff: StaffListItem;
  onEdit?: (id: string) => void;
  onArchive: (id: string, name: string, archive: boolean) => void;
  archivePending: boolean;
}) {
  const color = staff.color ?? staffColor(staff.id);
  const resendInvite = useResendStaffInvite();
  const isAdmin = staff.role === 'admin';
  const showPending = staff.canEdit && !staff.hasAccess && Boolean(staff.email);
  const whatsappHref = staff.phone ? toWhatsAppHref(staff.phone) : null;

  return (
    <li
      className="group relative flex flex-col gap-4 overflow-hidden rounded-card border border-border bg-surface p-5 pl-6 shadow-sm transition hover:border-primary/30"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      {/* Linha superior: avatar + info + ações no topo */}
      <div className="flex items-start gap-4">
        <Avatar name={staff.name} url={staff.avatarUrl} color={color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text-body">{staff.name}</p>
          {staff.specialty && (
            <p className="mt-0.5 truncate text-sm text-text-muted">
              {staff.specialty}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            {/* Badge soft premium: Agendável / Indisponível */}
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${
                staff.isBookable
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {staff.isBookable ? (
                <CalendarCheck2 className="size-3" />
              ) : (
                <CalendarX2 className="size-3.5" />
              )}
              {staff.isBookable ? 'Agendável' : 'Indisponível'}
            </span>

            {!staff.isArchived && (
              <Link
                to="/admin/equipe/$staffId/horarios"
                params={{ staffId: staff.id }}
                aria-label={`Horários de ${staff.name}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-muted transition hover:bg-surface-2 hover:text-text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <CalendarRange className="size-3.5" />
                Horários
              </Link>
            )}
          </div>
        </div>

        {/* Ações no topo direito */}
        {staff.canEdit && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && !staff.isArchived && (
              <button
                type="button"
                onClick={() => onEdit(staff.id)}
                aria-label={`Editar ${staff.name}`}
                className="rounded-lg p-2 text-text-muted transition hover:bg-surface-2 hover:text-text-body focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {staff.isArchived ? (
              <button
                type="button"
                disabled={archivePending}
                onClick={() => onArchive(staff.id, staff.name, false)}
                aria-label={`Reativar ${staff.name}`}
                className="inline-flex items-center gap-1.5 rounded-lg p-2 text-emerald-500 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArchiveRestore className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={archivePending}
                onClick={() => onArchive(staff.id, staff.name, true)}
                aria-label={`Arquivar ${staff.name}`}
                className="inline-flex items-center gap-1.5 rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Archive className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rodapé: admin badge, email, phone, convite */}
      {(isAdmin || staff.email || staff.phone || showPending) && (
        <div className="space-y-1.5 border-t border-border pt-3">
          {isAdmin && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold leading-none text-primary">
              Admin
            </span>
          )}
          {staff.email && (
            <p className="flex items-center gap-2 truncate text-sm text-text-muted">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{staff.email}</span>
            </p>
          )}
          {staff.phone && (
            <p className="flex items-center justify-between gap-2 text-sm text-text-muted">
              <span className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0" />
                {formatPhone(staff.phone)}
              </span>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${staff.name}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#25D366] transition hover:bg-[#25D366]/10"
                >
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </a>
              )}
            </p>
          )}
          {/* Convite pendente */}
          {showPending && !staff.isArchived && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500">
                <AlertCircle className="size-3.5 shrink-0" />
                Convite pendente
              </span>
              <button
                type="button"
                onClick={() =>
                  resendInvite.mutate({ email: staff.email as string })
                }
                disabled={resendInvite.isPending}
                aria-label={`Reenviar convite para ${staff.name}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-amber-500 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="size-3.5" />
                {resendInvite.isPending ? 'Enviando…' : 'Reenviar'}
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function StaffList({ onCreate, onEdit }: StaffListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const { data: staff, isLoading, isError } = useStaffList(showArchived);
  const archiveMut = useArchiveStaff();

  async function handleArchive(id: string, name: string, archive: boolean) {
    try {
      await archiveMut.mutateAsync({ id, archive });
      toast.success(
        archive ? `${name} foi arquivado.` : `${name} foi reativado.`,
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Falha ao atualizar profissional.',
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* Header: toggle ativos/arquivados + criar */}
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowArchived((v) => !v)}
          className="text-primary hover:bg-primary/10"
        >
          <Archive className="size-4 text-primary" />
          {showArchived ? 'Ver ativos' : 'Ver arquivados'}
        </Button>
        {!showArchived && <CreateButton onCreate={onCreate} />}
      </div>

      {/* Loading */}
      {isLoading && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StaffCardSkeleton key={i} />
          ))}
        </ul>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex items-center gap-2 rounded-card border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">
          <AlertCircle className="size-4 shrink-0" />
          Falha ao carregar profissionais.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (staff?.length ?? 0) === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border p-10 text-center">
          <Users className="size-8 text-text-muted" />
          <p className="text-sm text-text-muted">
            {showArchived
              ? 'Nenhum profissional arquivado.'
              : 'Nenhum profissional cadastrado.'}
          </p>
          {!showArchived && <CreateButton onCreate={onCreate} />}
        </div>
      )}

      {/* Lista */}
      {!isLoading && !isError && (staff?.length ?? 0) > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {staff!.map((s) => (
            <StaffCard
              key={s.id}
              staff={s}
              onEdit={onEdit}
              onArchive={handleArchive}
              archivePending={archiveMut.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}