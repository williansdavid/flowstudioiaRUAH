// src/features/crm/components/CrmPage.tsx

import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { dailyTasksQueryOptions, useResolveCrmTask, type DailyTasksData } from '@/features/crm/hooks';
import { TasksPage, type TasksPageProps } from '@/features/crm';
import { updateAppointmentStatus } from '@/features/crm/server/updateAppointmentStatus';

export const Route = createFileRoute('/_authed/admin/crm')({
  staticData: { title: 'Tarefas do dia' },
  component: CrmPage,
});

function CrmPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: tasks } = useSuspenseQuery(dailyTasksQueryOptions);
  const resolveCrmTaskMutation = useResolveCrmTask();

  const updateStatusMutation = useMutation({
    mutationFn: (input: { id: string; status: 'pending' | 'confirmed' | 'completed' | 'no_show' | 'cancelled' }) =>
      updateAppointmentStatus({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'dailyTasks'] });
      toast.success('Agendamento atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar agendamento: ${error.message}`);
    },
  });

  const handleMarkNoShow = (id: string) => {
    const appointmentId = id.replace('apt-', '');
    updateStatusMutation.mutate({ id: appointmentId, status: 'no_show' });
  };

  const handleComplete = (id: string) => {
    const appointmentId = id.replace('apt-', '');
    navigate({ to: '/admin/pdv', search: { appointmentId } });
  };

  const handleConfirm = (id: string) => {
    const appointmentId = id.replace('apt-', '');
    updateStatusMutation.mutate({ id: appointmentId, status: 'confirmed' });
  };

  const handleRemove = (id: string) => {
    const clientId = id.replace('bday-', '').replace('rem-', '');
    const taskType = id.startsWith('bday-') ? 'birthday' : 'remarketing';
    const today = new Date();
    const referenceDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    resolveCrmTaskMutation.mutate({ clientId, taskType, referenceDate });
  };

  return (
    <TasksPage
      tasks={tasks}
      isLoading={false}
      error={null}
      onMarkNoShow={handleMarkNoShow}
      onComplete={handleComplete}
      onConfirm={handleConfirm}
      onRemove={handleRemove}
    />
  );
}