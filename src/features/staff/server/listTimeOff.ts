// src/features/staff/server/listTimeOff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const listSchema = z.object({
  // admin: filtra por staff; staff: ignorado (RLS já limita ao próprio)
  staffId: z.string().uuid().nullable().optional(),
});

export type ListTimeOffInput = z.infer<typeof listSchema>;

export interface TimeOffItem {
  id: string;
  staffId: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  reason: string | null;
  createdBy: string | null;
  createdAt: string; // ISO UTC
}

interface TimeOffRow {
  id: string;
  staff_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export const listTimeOff = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => listSchema.parse(data))
  .handler(async ({ data }): Promise<TimeOffItem[]> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[staff] Sessão inválida.');
    }

    let query = supabase
      .from('staff_time_off')
      .select('id, staff_id, starts_at, ends_at, reason, created_by, created_at')
      .order('starts_at', { ascending: false });

    if (data.staffId) {
      query = query.eq('staff_id', data.staffId);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    return (rows as TimeOffRow[]).map((r) => ({
      id: r.id,
      staffId: r.staff_id,
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      reason: r.reason,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  });
