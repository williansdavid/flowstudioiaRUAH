import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { TaskItem } from '../types';

export const getDailyTasks = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = createSupabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('[crm] Sessão inválida.');

  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

  const tasks: TaskItem[] = [];

  // 1. AGENDAMENTOS PENDING - com tratamento de erro
  try {
    const { data: pendingAppointments, error: aptError } = await supabase
      .from('appointments')
      .select('id, client_id, starts_at, service_id')
      .eq('status', 'pending')
      .limit(10); // Aumentado de 4 para 10

    if (aptError) {
      console.error('[crm] Erro ao buscar agendamentos pending:', aptError);
    } else if (pendingAppointments && pendingAppointments.length > 0) {
      console.log(`[crm] Encontrados ${pendingAppointments.length} agendamentos pending`);

      // Buscar clientes e serviços separadamente
      const clientIds = [...new Set(pendingAppointments.map(a => a.client_id).filter(Boolean))];
      const serviceIds = [...new Set(pendingAppointments.map(a => a.service_id).filter(Boolean))];

      let clientMap = new Map();
      let serviceMap = new Map();

      // Buscar clientes com tratamento de erro
      if (clientIds.length > 0) {
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('id, full_name, phone')
          .in('id', clientIds);

        if (clientError) {
          console.error('[crm] Erro ao buscar clientes:', clientError);
        } else if (clients) {
          clientMap = new Map(clients.map(c => [c.id, c]));
          console.log(`[crm] Carregados ${clients.length} clientes`);
        }
      }

      // Buscar serviços com tratamento de erro
      if (serviceIds.length > 0) {
        const { data: services, error: serviceError } = await supabase
          .from('services')
          .select('id, name')
          .in('id', serviceIds);

        if (serviceError) {
          console.error('[crm] Erro ao buscar serviços:', serviceError);
        } else if (services) {
          serviceMap = new Map(services.map(s => [s.id, s]));
          console.log(`[crm] Carregados ${services.length} serviços`);
        }
      }

      // Criar tarefas apenas se cliente existe
      pendingAppointments.forEach((apt) => {
        const client = clientMap.get(apt.client_id);
        const service = serviceMap.get(apt.service_id);

        // Validar que cliente existe
        if (!client) {
          console.warn(`[crm] Cliente ${apt.client_id} não encontrado para agendamento ${apt.id}`);
          return;
        }

        const isInPast = new Date(apt.starts_at) < today;
        const taskType = isInPast ? 'pending_past' : 'to_confirm';

        tasks.push({
          id: `apt-${apt.id}`,
          type: taskType,
          clientId: apt.client_id,
          clientName: client.full_name || 'Cliente',
          clientPhone: client.phone,
          title: `${service?.name || 'Serviço'} - ${isInPast ? 'Sem conclusão' : 'Confirmar'}`,
          description: isInPast
            ? `Agendamento não foi concluído. Estava marcado para ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(apt.starts_at))}.`
            : `Agendado para ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(apt.starts_at))}. Aguardando confirmação.`,
          date: apt.starts_at,
        });
      });

      console.log(`[crm] Criadas ${tasks.length} tarefas de agendamento`);
    }
  } catch (error) {
    console.error('[crm] Erro crítico ao processar agendamentos:', error);
  }

  // 2. ANIVERSARIANTES DA SEMANA - com tratamento de erro
  try {
    const { data: bdayClients, error: bdayError } = await supabase
      .from('clients')
      .select('id, full_name, phone, birth_date')
      .not('birth_date', 'is', null);

    if (bdayError) {
      console.error('[crm] Erro ao buscar aniversariantes:', bdayError);
    } else if (bdayClients) {
      const candidates = bdayClients.filter((c) => {
        const bDate = new Date(c.birth_date!);
        const bMonth = bDate.getMonth() + 1;
        const bDay = bDate.getDate();
        return bMonth === currentMonth && bDay >= currentDay && bDay <= currentDay + 7;
      });

      if (candidates.length > 0) {
        const candidateIds = candidates.map((c) => c.id);
        const { data: bdayLogs, error: logError } = await supabase
          .from('crm_logs')
          .select('client_id')
          .in('client_id', candidateIds)
          .eq('task_type', 'birthday')
          .gte('reference_date', `${currentYear}-01-01`)
          .lte('reference_date', `${currentYear}-12-31`);

        if (logError) {
          console.error('[crm] Erro ao buscar logs de aniversário:', logError);
        }

        const loggedIds = new Set((bdayLogs || []).map((l) => l.client_id));
        const filtered = candidates.filter((c) => !loggedIds.has(c.id)).slice(0, 4);

        filtered.forEach((c) => {
          const bDate = new Date(c.birth_date!);
          tasks.push({
            id: `bday-${c.id}`,
            type: 'birthday',
            clientId: c.id,
            clientName: c.full_name || 'Cliente',
            clientPhone: c.phone,
            title: 'Aniversariante da Semana',
            description: `Faz aniversário dia ${bDate.getDate()}/${currentMonth}. Mande uma mensagem de parabéns!`,
            date: c.birth_date,
          });
        });

        console.log(`[crm] Criadas ${filtered.length} tarefas de aniversário`);
      }
    }
  } catch (error) {
    console.error('[crm] Erro crítico ao processar aniversariantes:', error);
  }

  // 3. REMARKETING (clientes inativos > 45 dias) - com tratamento de erro
  try {
    const { data: remarketingClients, error: remError } = await supabase
      .from('clients')
      .select('id, full_name, phone, last_visit')
      .not('last_visit', 'is', null)
      .lt('last_visit', fortyFiveDaysAgo.toISOString());

    if (remError) {
      console.error('[crm] Erro ao buscar clientes para remarketing:', remError);
    } else if (remarketingClients) {
      const candidates = remarketingClients.slice(0, 10);

      if (candidates.length > 0) {
        const candidateIds = candidates.map((c) => c.id);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const { data: remLogs, error: logError } = await supabase
          .from('crm_logs')
          .select('client_id')
          .in('client_id', candidateIds)
          .eq('task_type', 'remarketing')
          .gte('reference_date', monthStart.toISOString().split('T')[0]!);

        if (logError) {
          console.error('[crm] Erro ao buscar logs de remarketing:', logError);
        }

        const loggedIds = new Set((remLogs || []).map((l) => l.client_id));
        const filtered = candidates.filter((c) => !loggedIds.has(c.id)).slice(0, 4);

        filtered.forEach((c) => {
          const diffDays = Math.ceil(
            (today.getTime() - new Date(c.last_visit!).getTime()) / (1000 * 60 * 60 * 24)
          );
          tasks.push({
            id: `rem-${c.id}`,
            type: 'remarketing',
            clientId: c.id,
            clientName: c.full_name || 'Cliente',
            clientPhone: c.phone,
            title: 'Remarketing',
            description: `Não visita o studio há ${diffDays} dias. Última visita foi em ${new Intl.DateTimeFormat('pt-BR').format(new Date(c.last_visit!))}`,
            date: c.last_visit,
          });
        });

        console.log(`[crm] Criadas ${filtered.length} tarefas de remarketing`);
      }
    }
  } catch (error) {
    console.error('[crm] Erro crítico ao processar remarketing:', error);
  }

  console.log(`[crm] Total de tarefas retornadas: ${tasks.length}`);
  return tasks;
});