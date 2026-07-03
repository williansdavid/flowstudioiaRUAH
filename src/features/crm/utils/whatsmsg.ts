// src/features/crm/utils/whatsmsg.ts

export const WHATS_MSG = {
  /** Confirmar agendamento — enviado ao confirmar horário do cliente */
  confirmAppointment: (params: {
    clientName: string;
    date: string;
    time: string;
    serviceName: string;
    staffName: string;
    studioName: string;
  }) =>
  `Olá ${params.clientName}! Tudo bem por aí? 😊\n\n` +
  `Passando para confirmar seu agendamento:\n` +
  `✂️ ${params.serviceName} com ${params.staffName}\n` +
  `📅 ${params.date} às ${params.time}\n` +
  `📍 ${params.studioName}\n\n` +
  `Posso confirmar? ✅`,


  
  /** Aniversário — parabéns + oferta opcional */
  birthday: (params: {
    clientName: string;
    studioName: string;
    benefit?: string;
  }) =>
    `🎂 Feliz aniversário, ${params.clientName}! 🎉\n\n` +
    `A equipe ${params.studioName} deseja um dia incrível pra você!` +
    (params.benefit
      ? `\n\nPreparamos ${params.benefit} no seu próximo agendamento como presente. 🎁`
      : `\n\nEsperamos você em breve pra comemorar com a gente!`) +
    `\n\nQual horário funciona melhor?`,

  /** Remarketing — cliente sem retorno há X dias */
  remarketing: (params: {
    clientName: string;
    daysSinceLastVisit: number;
    studioName: string;
  }) =>
    `Olá ${params.clientName}! 👋\n\n` +
    `Já faz ${params.daysSinceLastVisit} dias desde sua última visita no ${params.studioName}, ` +
    `e sentimos sua falta! 😊\n\n` +
    `Que tal agendar um horário essa semana?\n` +
    `📅 Seg a Sex: 09h às 19h\n` +
    `📅 Sáb: 08h às 16h\n\n` +
    `É só responder essa mensagem ou chamar no WhatsApp. Esperamos você! ✂️`,
} as const;