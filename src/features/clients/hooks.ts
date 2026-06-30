// src/features/clients/hooks.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { listClients } from './server/listClients'
import { getClientAlerts } from './server/getClientAlerts'
import { getClientProfile } from './server/getClientProfile'
import { getClientHistory } from './server/getClientHistory'
import { getClientInsights } from './server/getClientInsights'
import { getClientTimeline } from './server/getClientTimeline'
import { updateClient } from './server/updateClient'
import { createClient } from './server/createClient'
import { getClientKpis } from './server/getClientKpis'
import type { CreateClientInput } from './server/createClient'
import type { ClientKpisResponse } from './server/getClientKpis'

import type {
  ListClientsResponse,
  ClientAlertsResponse,
  ClientProfile,
  ClientHistoryResponse,
  ClientInsightsResponse,
  ClientTimelineResponse,
  ClientQueryParams,
  UpdateClientInput,
} from './types'

import { getBirthdayClients } from './server/getBirthdayClients'
import type { GetBirthdayClientsResponse } from './server/getBirthdayClients'
import { getNoReturnClients } from './server/getNoReturnClients'
import type { GetNoReturnClientsResponse } from './server/getNoReturnClients'
/* ───────── Queries ───────── */

export function useClientsList(params: ClientQueryParams) {
  return useQuery<ListClientsResponse>({
    queryKey: ['clients', 'list', params],
    queryFn: () => listClients({ data: params }),
    staleTime: 30_000,
  })
}

export function useClientAlerts() {
  return useQuery<ClientAlertsResponse>({
    queryKey: ['clients', 'alerts'],
    queryFn: () => getClientAlerts(),
    staleTime: 60_000,
  })
}

export function useClientProfile(clientId: string | null) {
  return useQuery<ClientProfile>({
    queryKey: ['clients', 'profile', clientId],
    queryFn: () => getClientProfile({ data: { clientId: clientId! } }),
    enabled: Boolean(clientId),
    staleTime: 60_000,
  })
}

export function useClientHistory(
  clientId: string | null,
  page = 1,
  pageSize = 20,
) {
  return useQuery<ClientHistoryResponse>({
    queryKey: ['clients', 'history', clientId, page, pageSize],
    queryFn: () =>
      getClientHistory({ data: { clientId: clientId!, page, pageSize } }),
    enabled: Boolean(clientId),
    staleTime: 60_000,
  })
}

export function useClientInsights(clientId: string | null) {
  return useQuery<ClientInsightsResponse>({
    queryKey: ['clients', 'insights', clientId],
    queryFn: () => getClientInsights({ data: { clientId: clientId! } }),
    enabled: Boolean(clientId),
    staleTime: 60_000,
  })
}

export function useClientTimeline(clientId: string | null) {
  return useQuery<ClientTimelineResponse>({
    queryKey: ['clients', 'timeline', clientId],
    queryFn: () => getClientTimeline({ data: { clientId: clientId! } }),
    enabled: Boolean(clientId),
    staleTime: 30_000,
  })
}

/* ───────── Mutations ───────── */

export function useClientKpis() {
  return useQuery<ClientKpisResponse>({
    queryKey: ['clients', 'kpis'],
    queryFn: () => getClientKpis(),
    staleTime: 60_000,
  })
}

export function useBirthdayClients() {
  return useQuery<GetBirthdayClientsResponse>({
    queryKey: ['clients', 'birthday'],
    queryFn: () => getBirthdayClients(),
    staleTime: 60_000,
  })
}

export function useNoReturnClients() {
  return useQuery<GetNoReturnClientsResponse>({
    queryKey: ['clients', 'noReturn'],
    queryFn: () => getNoReturnClients(),
    staleTime: 60_000,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateClientInput) =>
      createClient({ data: input }),
    onSuccess: () => {
      toast.success('Cliente cadastrado.')
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao cadastrar cliente.')
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateClientInput) =>
      updateClient({ data: input }),
    onSuccess: () => {
      toast.success('Cliente atualizado.')
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar cliente.')
    },
  })
}