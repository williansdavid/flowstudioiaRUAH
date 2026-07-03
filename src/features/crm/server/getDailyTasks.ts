import { createServerFn } from '@tanstack/react-start';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { TaskItem } from '../types';

export const getDailyTasks = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = createSupabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('[crm] Sessão inválida.');

  const today = new Date();
  //today.setDate(today.getDate() - 1);
  const currentYear = today.getFullYear().toString();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

  const tasks: TaskItem[] = [];

  // ────────────────────────────────────────────────────────────────
  // CARD "Sem conclusão" — appointments pending com data PASSADA
  // ────────────────────────────────────────────────────────────────
  try {
    const { data: pastAppointments, error: aptError } = await supabase
      .from('appointments')
      .select('id, client_id, starts_at, service_id, staff_id')  // ← +staff_id
      .eq('status', 'pending')
      .lt('starts_at', today.toISOString())
      .order('starts_at', { ascending: false })
      .limit(10);

    if (aptError) {
      console.error('[crm] Erro ao buscar agendamentos do passado:', aptError);
    } else if (pastAppointments && pastAppointments.length > 0) {
      console.log(`[crm] Card "Sem conclusão" — ${pastAppointments.length} agendamentos pendentes do passado`);

      const clientIds = [...new Set(pastAppointments.map(a => a.client_id).filter(Boolean))];
      const serviceIds = [...new Set(pastAppointments.map(a => a.service_id).filter(Boolean))];
      const staffIds = [...new Set(pastAppointments.map(a => a.staff_id).filter(Boolean))];    

      let clientMap = new Map();
      let serviceMap = new Map();
      let staffMap = new Map();  

      if (clientIds.length > 0) {
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('id, full_name, phone')
          .in('id', clientIds);

        if (clientError) {
          console.error('[crm] Erro ao buscar clientes:', clientError);
        } else if (clients) {
          clientMap = new Map(clients.map(c => [c.id, c]));
        }
      }

      if (serviceIds.length > 0) {
        const { data: services, error: serviceError } = await supabase
          .from('services')
          .select('id, name')
          .in('id', serviceIds);

        if (serviceError) {
          console.error('[crm] Erro ao buscar serviços:', serviceError);
        } else if (services) {
          serviceMap = new Map(services.map(s => [s.id, s]));
        }
      }
      if (staffIds.length > 0) {
        const { data: staffList, error: staffError } = await supabase
          .from('staff')
          .select('id, full_name')
          .in('id', staffIds);
        if (staffError) {
          console.error('[crm] Erro ao buscar staffs:', staffError);
        } else if (staffList) {
          staffMap = new Map(staffList.map(s => [s.id, s]));
        } 
      }
      

      pastAppointments.forEach((apt) => {
        const client = clientMap.get(apt.client_id);
        const service = serviceMap.get(apt.service_id);
        const staff = staffMap.get(apt.staff_id);  // ← NOVO

        if (!client) {
          console.warn(`[crm] Cliente ${apt.client_id} não encontrado para agendamento ${apt.id}`);
          return;
        }

        const aptDate = new Date(apt.starts_at);

        tasks.push({
          id: `apt-${apt.id}`,
          type: 'pending_past',
          clientId: apt.client_id,
          clientName: client.full_name || 'Cliente',
          clientPhone: client.phone,
          title: `${service?.name || 'Serviço'} - ${staff?.full_name || 'Profissional'}`,  // ← alterado
          description: `Agendamento não foi concluído. ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short'}).format(aptDate)} às ${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(aptDate)}h`,
          date: apt.starts_at,                         
        });
      });

      console.log(`[crm] Card "Sem conclusão" — ${pastAppointments.length} tarefas criadas`);
    }
  } catch (error) {
    console.error('[crm] Erro crítico ao processar agendamentos do passado:', error);
  }

// ────────────────────────────────────────────────────────────────
// CARD "Confirmar" — appointments pending com data FUTURA (hoje ou depois)
// ────────────────────────────────────────────────────────────────
try {
    const { data: futureAppointments, error: aptError } = await supabase
      .from('appointments')
      .select('id, client_id, starts_at, service_id, staff_id')  // ← +staff_id
      .eq('status', 'pending')
      .gte('starts_at', today.toISOString())
      .order('starts_at', { ascending: true })
      .limit(10);

    if (aptError) {
      console.error('[crm] Erro ao buscar agendamentos do futuro:', aptError);
    } else if (futureAppointments && futureAppointments.length > 0) {
      console.log(`[crm] Card "Confirmar" — ${futureAppointments.length} agendamentos pendentes do futuro`);

      const clientIds = [...new Set(futureAppointments.map(a => a.client_id).filter(Boolean))];
      const serviceIds = [...new Set(futureAppointments.map(a => a.service_id).filter(Boolean))];
      const staffIds = [...new Set(futureAppointments.map(a => a.staff_id).filter(Boolean))];  // ← NOVO

      let clientMap = new Map();
      let serviceMap = new Map();
      let staffMap = new Map();  // ← NOVO

      if (clientIds.length > 0) {
        const { data: clients, error: clientError } = await supabase
          .from('clients')
          .select('id, full_name, phone')
          .in('id', clientIds);

        if (clientError) {
          console.error('[crm] Erro ao buscar clientes:', clientError);
        } else if (clients) {
          clientMap = new Map(clients.map(c => [c.id, c]));
        }
      }

      if (serviceIds.length > 0) {
        const { data: services, error: serviceError } = await supabase
          .from('services')
          .select('id, name')
          .in('id', serviceIds);

        if (serviceError) {
          console.error('[crm] Erro ao buscar serviços:', serviceError);
        } else if (services) {
          serviceMap = new Map(services.map(s => [s.id, s]));
        }
      }

      // ← NOVO: buscar staffs
      if (staffIds.length > 0) {
        const { data: staffList, error: staffError } = await supabase
          .from('staff')
          .select('id, full_name')
          .in('id', staffIds);

        if (staffError) {
          console.error('[crm] Erro ao buscar staffs:', staffError);
        } else if (staffList) {
          staffMap = new Map(staffList.map(s => [s.id, s]));
        }
      }

      futureAppointments.forEach((apt) => {
        const client = clientMap.get(apt.client_id);
        const service = serviceMap.get(apt.service_id);
        const staff = staffMap.get(apt.staff_id);  // ← NOVO

        if (!client) {
          console.warn(`[crm] Cliente ${apt.client_id} não encontrado para agendamento ${apt.id}`);
          return;
        }

        const aptDate = new Date(apt.starts_at);
        const timeStr = aptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        tasks.push({
          id: `apt-${apt.id}`,
          type: 'to_confirm',
          clientId: apt.client_id,
          clientName: client.full_name || 'Cliente',
          clientPhone: client.phone,
          title: `${service?.name || 'Serviço'} - ${staff?.full_name || 'Profissional'}`,  // ← alterado
          description: `Agendado para ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(aptDate)} às ${timeStr}h`,  // ← alterado
          date: apt.starts_at,
          serviceName: service?.name,  // ← NOVO
          time: timeStr,  // ← NOVO
        });
      });

      console.log(`[crm] Card "Confirmar" — ${futureAppointments.length} tarefas criadas`);
    }
  } catch (error) {
    console.error('[crm] Erro crítico ao processar agendamentos do futuro:', error);
  }

  // ────────────────────────────────────────────────────────────────
  // CARD "Aniversários" — clientes aniversariantes da semana
  // ────────────────────────────────────────────────────────────────
  try {
    const { data: bdayClients, error: bdayError } = await supabase
      .from('clients')
      .select('id, full_name, phone, birth_date')
      .not('birth_date', 'is', null);

    if (bdayError) {
      console.error('[crm] Erro ao buscar aniversariantes:', bdayError);
    } else if (bdayClients) {
      const candidates = bdayClients.filter((c) => {
        const [bYear, bMonth, bDay] = c.birth_date!.split('-').map(Number);
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
          const [bYear, bMonth, bDay] = c.birth_date!.split('-').map(Number);       
          tasks.push({
            id: `bday-${c.id}`,
            type: 'birthday',
            clientId: c.id,
            clientName: c.full_name || 'Cliente',
            clientPhone: c.phone,
            title: 'Aniversariante da Semana',
            description: `Faz aniversário dia ${bDay} / ${currentMonth}. Mande uma mensagem de parabéns!`,
            date: `${bDay}/${currentMonth}`,
          });
        });

        console.log(`[crm] Card "Aniversários" — ${filtered.length} tarefas criadas`);
      }
    }
  } catch (error) {
    console.error('[crm] Erro crítico ao processar aniversariantes:', error);
  }

  // ────────────────────────────────────────────────────────────────
  // CARD "Inativos" — clientes sem visita há 45+ dias (remarketing)
  // ────────────────────────────────────────────────────────────────
  try {
    const { data: remarketingClients, error: remError } = await supabase
      .from('clients')
      .select('id, full_name, phone, last_visit')
      .not('last_visit', 'is', null)
      .lt('last_visit', fortyFiveDaysAgo.toISOString())
      .order('last_visit', { ascending: false });

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

        console.log(`[crm] Card "Inativos" — ${filtered.length} tarefas criadas`);
      }
    }
  } catch (error) {
    console.error('[crm] Erro crítico ao processar remarketing:', error);
  }

  console.log(`[crm] Total de tarefas retornadas: ${tasks.length}`);
  return tasks;
});