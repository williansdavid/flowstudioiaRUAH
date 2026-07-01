import { cn } from '@/lib/cn';
import { formatPhoneBR } from '@/lib/core/utils/phone';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Gift, CheckCircle } from 'lucide-react';

interface TaskCardAniversarioProps {
  id: string;
  clientName: string;
  clientPhone: string | null;
  title: string;
  description: string;
  date: string;
  onRemove: (id: string) => void;
}

export function TaskCardAniversario({
  id,
  clientName,
  clientPhone,
  title,
  description,
  date,
  onRemove,
}: TaskCardAniversarioProps) {
  const initials = clientName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('');

  const whatsappHref = clientPhone ? toWhatsAppHref(clientPhone) : null;

  const handleResolve = () => onRemove(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-white rounded-lg shadow-md p-4 space-y-4"
    >
      {/* Cabeçalho: Avatar + Nome/Telefone */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
            'bg-pink-500/10 text-pink-600 text-lg font-semibold'
          )}
        >
          {initials || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{clientName}</p>
          {clientPhone && whatsappHref && (
            <a
              href={whatsappHref ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{formatPhoneBR(clientPhone)}</span>
            </a>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-pink-500" />
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
        <div className="inline-flex">
          <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700">
            Aniversário
          </span>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 pt-1">
        {whatsappHref && (
          <a
            href={whatsappHref ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium',
              'bg-green-600 text-white shadow-sm hover:bg-green-700 active:scale-95 transition-all'
            )}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        <button
          onClick={handleResolve}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium',
            'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all'
          )}
        >
          <CheckCircle className="h-4 w-4" />
          Resolver
        </button>
      </div>
    </motion.div>
  );
}