import { motion } from 'framer-motion';
import { Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPhoneBR } from '@/lib/core/utils/phone';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';

interface TaskCardInativoProps {
  id: string;
  clientName: string;
  clientPhone: string | null;
  title: string;
  description: string;
  date: string; // ISO ou DD/MM/YYYY
  onRemove: (id: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
}

function parseTaskDate(dateStr: string): Date | null {
  // Tenta ISO 8601 (yyyy-mm-dd)
  let date = new Date(dateStr + 'T00:00:00');
  if (!isNaN(date.getTime())) return date;

  // Tenta DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10);
    const year = parseInt(parts[2]!, 10);
    date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

function getDaysAgo(dateStr: string): string {
  const date = parseTaskDate(dateStr);
  if (!date) return 'data inválida';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

export function TaskCardInativo({
  id,
  clientName,
  clientPhone,
  title,
  description,
  date,
  onRemove,
}: TaskCardInativoProps) {
  const initials = getInitials(clientName);
  const daysAgo = getDaysAgo(date);
  const phone = clientPhone ? formatPhoneBR(clientPhone) : null;
  const whatsappHref = clientPhone ? toWhatsAppHref(clientPhone) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl bg-white p-4 shadow-md ring-1 ring-gray-200 space-y-3"
    >
      {/* Cabeçalho com avatar, nome e telefone */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{clientName}</p>
          {phone && (
            <a
              href={whatsappHref ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-0.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Phone className="w-3 h-3" />
              {phone}
            </a>
          )}
          {!phone && <p className="text-xs text-gray-400 mt-0.5">Sem telefone</p>}
        </div>
        <span className="flex-shrink-0 text-xs text-gray-400">{daysAgo}</span>
      </div>

      {/* Título e badge */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          Remarketing
        </span>
      </div>

      {/* Descrição */}
      <p className="text-xs text-gray-600 leading-relaxed">{description}</p>

      {/* Botões */}
      <div className="flex items-center gap-2 pt-1">
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
              'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95',
              'transition-all duration-150'
            )}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        )}
        <button
          onClick={() => onRemove(id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
            'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95',
            'transition-all duration-150'
          )}
        >
          <CheckCircle className="w-4 h-4" />
          Resolver
        </button>
      </div>
    </motion.div>
  );
}