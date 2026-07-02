import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { dailyTasksQueryOptions, useResolveCrmTask, type DailyTasksData } from '@/features/crm/hooks';
import { TasksPage, type TasksPageProps } from '@/features/crm';
import { updateAppointmentStatus } from '@/features/crm/server/updateAppointmentStatus';

export const Route = createFileRoute('/_authed/admin/crm')({
  staticData: { title: 'Tarefas do dia' },
  component: CrmPage,
});

function CrmPage() {
  const { data: tasks, isLoading, error } = useSuspenseQuery(dailyTasksQueryOptions);
  const resolveCrmTaskMutation = useResolveCrmTask();
  const updateStatusMutation = useMutation({
    mutationFn: (input: { id: string; status: string }) =>
      updateAppointmentStatus({ data: input }),
  });

  const handleMarkNoShow = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'no_show' });
  };

  const handleComplete = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'completed' });
  };

  const handleConfirm = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'confirmed' });
  };

  const handleRemove = (id: string) => {
    const today = new Date();
    const referenceDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    resolveCrmTaskMutation.mutate({
      clientId: id,
      taskType: 'birthday',
      referenceDate,
    });
  };

  const handleWhatsApp = (phone: string) => {
    const href = `https://wa.me/${phone.replace(/\D/g, '')}`;
    window.open(href, '_blank');
  };

  return (
    <TasksPage
      tasks={tasks}
      isLoading={isLoading}
      error={error}
      onMarkNoShow={handleMarkNoShow}
      onComplete={handleComplete}
      onConfirm={handleConfirm}
      onRemove={handleRemove}
      onWhatsApp={handleWhatsApp}
    />
  );
}