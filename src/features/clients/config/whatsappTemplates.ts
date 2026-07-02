// src/features/clients/config/whatsappTemplates.ts

export type WaSegment =
  | 'birthday'
  | 'noReturn'
  | 'inactive'
  | 'vip'
  | 'new'
  | 'hasAppointment'
  | 'noPhone'
  | 'general'

export interface WaTemplateVars {
  name: string
  date?: string
  time?: string
}

const TEMPLATES: Record<WaSegment, (vars: WaTemplateVars) => string> = {
  birthday: ({ name }) =>
    `Oi ${name}, feliz aniversário! \u{1F382} A FlowStudio preparou um presente: 20% OFF no seu próximo serviço. Vem celebrar! \u{1F680}`,

  noReturn: ({ name }) =>
    `Oi ${name}, sentimos sua falta! Que tal agendar um dia pra gente? Temos um desconto especial pra voc\u00ea voltar \ud83d\ude0a`,

  inactive: ({ name }) =>
    `Oi ${name}, tudo bem? Faz tempo que n\u00e3o aparece por aqui. Queremos te ver de novo! Agende com 15% OFF \ud83d\ude80`,

  vip: ({ name }) =>
    `Oi ${name}, voc\u00ea \u00e9 cliente VIP! Tem uma oferta especial esperando por voc\u00ea na FlowStudio. Agende agora \ud83d\udc88\u2728`,

  new: ({ name }) =>
    `Oi ${name}, seja bem-vindo \u00e0 FlowStudio! Agende seu retorno e ganhe 10% OFF na segunda visita \ud83c\udf89`,

  hasAppointment: ({ name, date, time }) =>
    `Oi ${name}, lembramos do seu agendamento dia ${date} \u00e0s ${time}. Confirma? \ud83d\ude0a`,

  noPhone: ({ name }) =>
    `Oi ${name}, tudo bem? Passa na FlowStudio pra atualizarmos seu cadastro! \ud83d\udc88`,

  general: ({ name }) =>
    `Oi ${name}, tudo bem? Passa l\u00e1 na FlowStudio pra gente! \ud83d\udc88`,
}

export function buildWaLink(
  phone: string,
  templateKey: WaSegment,
  vars: WaTemplateVars,
): string | null {
  const cleaned = phone.replace(/\D/g, '').replace(/^55/, '')
  if (!cleaned) return null

  const message = TEMPLATES[templateKey](vars)
  return `https://wa.me/55${cleaned}?text=${encodeURIComponent(message)}`
}