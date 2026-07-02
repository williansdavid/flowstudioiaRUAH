import { motion } from 'framer-motion';
import { Phone, MessageCircle, CheckCircle, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPhoneBR } from '@/lib/core/utils/phone';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';

interface TaskCardConfirmarProps {
  id: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  description?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  onConfirm: (id: string) => void;
  onWhatsApp?: (phone: string) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
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
  onWhatsApp,
}: TaskCardConfirmarProps) {
  const formattedPhone = clientPhone ? formatPhoneBR(clientPhone) : null;
  const whatsappHref = clientPhone ? toWhatsAppHref(clientPhone) : null;

  const handleWhatsAppClick = () => {
    if (onWhatsApp && clientPhone) {
      onWhatsApp(clientPhone);
    } else if (whatsappHref) {
      window.open(whatsappHref, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-4 space-y-4 hover:shadow-lg transition-shadow"
    >
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
                <button
                  onClick={handleWhatsAppClick}
                  className="hover:underline cursor-pointer focus:outline-none"
                  type="button"
                >
                  {formattedPhone}
                </button>
              </div>
            )}
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Confirmar
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{serviceName}</span>
        </div>
        {description && (
          <p className="text-sm text-gray-500 ml-6">{description}</p>
        )}
      </div>

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

        {clientPhone && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsAppClick}
            className={cn(
              "flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium",
              "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
              "active:scale-95 transition-transform"
            )}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" />
            WhatsApp
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}