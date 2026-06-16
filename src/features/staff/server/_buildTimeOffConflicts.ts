// src/features/staff/server/_buildTimeOffConflicts.ts
import type { SupabaseClient } from '@supabase/supabase-js';

/** Status que ocupam slot (espelha getAvailableSlots). */
const OCCUPYING_STATUSES = ['pending', 'confirmed', 'completed'] as const;

export interface TimeOffConflict {
  clientName: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
}

interface ConflictRow {
  starts_at: string;
  ends_at: string;
  clients: { full_name: string | null } | null;
}

/**
 * Busca agendamentos ocupantes do staff que colidem com [startsAt, endsAt).
 * Overlap clássico: starts_at < endsAt && ends_at > startsAt.
 */
export async function buildTimeOffConflicts(
  supabase: SupabaseClient,
  staffId: string,
  startsAt: string,
  endsAt: string,
): Promise<TimeOffConflict[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('starts_at, ends_at, clients ( full_name )')
    .eq('staff_id', staffId)
    .in('status', OCCUPYING_STATUSES as unknown as string[])
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt)
    .order('starts_at', { ascending: true });

  if (error) throw error;

    return (data as unknown as ConflictRow[]).map((row) => ({
    clientName: row.clients?.full_name ?? 'Cliente',
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  }));
}
