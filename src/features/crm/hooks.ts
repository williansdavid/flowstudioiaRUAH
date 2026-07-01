// src/features/crm/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getDailyTasks } from './server/getDailyTasks';
import { resolveCrmTask } from './server/resolveCrmTask';
import type { TaskItem } from './types';

// --- Interface para dados organizados ---
export interface DailyTasksData {
  overdue: TaskItem[];
  pendingConfirmation: TaskItem[];
  birthdays: TaskItem[];
  inactive: TaskItem[];
}

// --- Query options para TanStack Query (SSR-safe) ---
export const dailyTasksQueryOptions = {
  queryKey: ['crm', 'dailyTasks'] as const,
  queryFn: async (): Promise<DailyTasksData> => {
    const tasks = await getDailyTasks();
    // Organizar em 4 seções baseado em task.type
    const organized: DailyTasksData = {
      overdue: tasks.filter(t => t.type === 'pending_past'),
      pendingConfirmation: tasks.filter(t => t.type === 'to_confirm'),
      birthdays: tasks.filter(t => t.type === 'birthday'),
      inactive: tasks.filter(t => t.type === 'remarketing'),
    };
    return organized;
  },
  staleTime: 5 * 60 * 1000, // 5 minutos
};

// --- Hook para buscar tarefas diárias ---
export function useGetDailyTasks() {
  return useQuery<DailyTasksData>(dailyTasksQueryOptions);
}

// --- Hook para resolver tarefa (Aniversário / Remarketing) ---
export function useResolveCrmTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { clientId: string; taskType: 'birthday' | 'remarketing'; referenceDate: string }) =>
      resolveCrmTask({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'dailyTasks'] });
      toast.success('Tarefa resolvida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao resolver tarefa: ${error.message}`);
    },
  });
}