import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  User,
  Phone,
  Calendar,
  Hash,
  Clock,
  Shield,
  Lock,
  KeyRound,
  Mail,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { getOwnClientProfile } from '@/features/clients/server/getOwnClientProfile'
import { useSession, useRequestPasswordReset } from '@/features/auth/hooks'

export const Route = createFileRoute('/_client/cliente/perfil')({
  component: ClientProfilePage,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: ['client', 'own-profile'],
      queryFn: () => getOwnClientProfile(),
    })
  },
})

// ─── Card de info no estilo do print (borda colorida no topo) ───

function InfoCard({
  icon,
  label,
  value,
  borderColor,
  isStatus,
  statusValue,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  borderColor: string
  isStatus?: boolean
  statusValue?: string
}) {
  const statusMap: Record<string, { label: string; dotColor: string }> = {
    active: { label: 'Ativo', dotColor: 'bg-green-400' },
    inactive: { label: 'Inativo', dotColor: 'bg-red-400' },
    vip: { label: 'VIP', dotColor: 'bg-amber-400' },
  }

  const status = statusValue ? statusMap[statusValue] : null

  return (
    <div
      className={`rounded-xl border border-slate-800/60 bg-slate-900/50 p-5 ${borderColor}`}
    >
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      {isStatus && status ? (
        <div className="mt-3 flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${status.dotColor}`} />
          <span className="text-lg font-bold text-slate-100">
            {status.label}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-lg font-bold leading-tight text-slate-100">
          {value}
        </p>
      )}
    </div>
  )
}

// ─── Página ───

function ClientProfilePage() {
  const { data: session } = useSession()
  const { data: profile } = useSuspenseQuery({
    queryKey: ['client', 'own-profile'],
    queryFn: () => getOwnClientProfile(),
  })

  const requestReset = useRequestPasswordReset()

  const handleChangePassword = () => {
    if (!session?.email) {
      toast.error('E-mail não disponível para recuperação.')
      return
    }
    requestReset.mutate(
      { email: session.email },
      {
        onSuccess: () => {
          toast.success(
            'E-mail de recuperação enviado! Verifique sua caixa de entrada.',
          )
        },
      },
    )
  }

  // ─── Empty state ───────────────────────────────

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
        <AlertCircle className="h-10 w-10" />
        <p className="text-sm font-medium">Perfil não encontrado</p>
        <p className="text-xs">Complete seu cadastro no próximo agendamento.</p>
      </div>
    )
  }

  // ─── Helpers ───────────────────────────────────

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CL'

  const formatPhone = (phone: string | null) => {
    if (!phone) return null
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    if (digits.length === 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return phone
  }

  return (
    <div className="space-y-6 py-4">
      {/* ─── Header: Avatar + Nome + Contato ──────── */}
      <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-lg font-bold text-cyan-400">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-100">
              {profile.full_name}
            </h1>
            {profile.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{formatPhone(profile.phone)}</span>
              </p>
            )}
            {profile.email && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Grid de cards (estilo print) ────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="Primeira visita"
          value={formatDate(profile.first_visit)}
          borderColor="border-t-4 border-t-violet-500"
        />
        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="Última visita"
          value={formatDate(profile.last_visit)}
          borderColor="border-t-4 border-t-green-500"
        />
        <InfoCard
          icon={<Hash className="h-4 w-4" />}
          label="Total de visitas"
          value={profile.total_visits}
          borderColor="border-t-4 border-t-amber-500"
        />
        <InfoCard
          icon={<Clock className="h-4 w-4" />}
          label="Frequência média"
          value={profile.frequency_days ? `${profile.frequency_days} dias` : '—'}
          borderColor="border-t-4 border-t-cyan-500"
        />
        <InfoCard
          icon={<Shield className="h-4 w-4" />}
          label="Status"
          value=""
          borderColor="border-t-4 border-t-emerald-500"
          isStatus
          statusValue={profile.status}
        />
      </div>

      {/* ─── Segurança / Alterar senha ───────────── */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Lock className="h-4 w-4 text-slate-500" />
          Segurança
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Um e-mail de recuperação será enviado para{' '}
          <span className="text-slate-400">
            {session?.email ?? 'seu e-mail cadastrado'}
          </span>
          .
        </p>
        <button
          onClick={handleChangePassword}
          disabled={requestReset.isPending}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700 active:scale-95 disabled:opacity-50"
        >
          <KeyRound className="h-4 w-4" />
          {requestReset.isPending ? 'Enviando...' : 'Alterar senha'}
        </button>
      </div>
    </div>
  )
}
