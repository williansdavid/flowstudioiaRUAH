import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Phone } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPhoneBR } from '@/lib/core/utils/phone';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { WHATS_MSG } from '../utils/whatsmsg';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function normalizeDate(dateStr: string): string {
  // Tenta parsear como ISO
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('pt-BR'); // 03/07/2026
  }
  return dateStr; // fallback
}

function normalizeTime(dateOrTime: string): string {
  // Se já veio formatado tipo "14:30", retorna direto
  if (/^\d{2}:\d{2}$/.test(dateOrTime)) return dateOrTime;

  // Tenta parsear como ISO
  const d = new Date(dateOrTime);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return dateOrTime; // fallback
}


interface TaskCardConfirmarProps {
  id: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  description?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  onConfirm: (id: string) => void;
  onLembrarDepois?: () => void;
}

export function TaskCardConfirmar({
  id,
  clientName,
  clientPhone,
  serviceName,
  description,
  scheduledDate,
  scheduledTime,
  onConfirm,
  onLembrarDepois,
}: TaskCardConfirmarProps) {
  const formattedPhone = clientPhone ? formatPhoneBR(clientPhone) : null;

const waHref = clientPhone
  ? toWhatsAppHref(
      clientPhone,
      WHATS_MSG.confirmAppointment({
        clientName,
        date: normalizeDate(scheduledDate),
        time: normalizeTime(scheduledTime),
        serviceName,
        staffName: 'nosso profissional',
        studioName: 'FlowStudio',
      }),
    )
  : null;;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-4 space-y-4 hover:shadow-lg transition-shadow"
    >
      {/* Cabeçalho com avatar + nome + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {getInitials(clientName)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{clientName}</h3>
            {formattedPhone && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span>{formattedPhone}</span>
              </div>
            )}
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Confirmar
        </span>
      </div>

      {/* Serviço */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{serviceName}</span>
        </div>
        {description && (
          <p className="text-sm text-gray-500 ml-6">{description}</p>
        )}
      </div>

      {/* Data e hora */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{scheduledDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{scheduledTime}</span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConfirm(id)}
          className={cn(
            "flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium",
            "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "active:scale-95 transition-transform"
          )}
        >
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Confirmar
        </motion.button>

        {/* WhatsApp — só envia mensagem, não muda status */}
        {waHref && <WhatsAppButton href={waHref} />}

        {onLembrarDepois && (
          <button
            onClick={onLembrarDepois}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Lembrar depois
          </button>
        )}
      </div>
    </motion.div>
  );
}