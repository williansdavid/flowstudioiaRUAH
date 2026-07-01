import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPhoneBR } from '@/lib/core/utils/phone';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';

interface TaskCardSemConclusaoProps {
  id: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  description?: string | null;
  date: string;
  time: string;
  onMarkNoShow: (id: string) => void;
  onComplete: (id: string) => void;
}


export function TaskCardSemConclusao({
  id,
  clientName,
  clientPhone,
  serviceName,
  description,
  date,
  time,
  onMarkNoShow,
  onComplete,
}: TaskCardSemConclusaoProps) {
  const whatsappHref = clientPhone ? toWhatsAppHref(clientPhone) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2"
    >
      {/* Cabeçalho com avatar, nome, telefone e data/hora */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {clientName}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {clientPhone ? formatPhoneBR(clientPhone) : 'Sem telefone'}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500 shrink-0">
          <p>{date}</p>
          <p>{time}</p>
        </div>
      </div>

      {/* Serviço e descrição */}
      <div className="text-sm">
        <p className="font-medium text-gray-800">{serviceName}</p>
        {description && (
          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
            {description} 
          </p>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={() => onMarkNoShow(id)}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition',
            'text-red-700 bg-red-100 hover:bg-red-200 active:scale-95'
          )}
        >
          <X size={14} />
          Não compareceu
        </button>

        <button
          onClick={() => onComplete(id)}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition',
            'text-green-700 bg-green-100 hover:bg-green-200 active:scale-95'
          )}
        >
          <Check size={14} />
          Concluir
        </button>

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition',
              'text-green-700 bg-green-100 hover:bg-green-200 active:scale-95'
            )}
          >
            <Phone size={14} />
            WhatsApp
          </a>
        ) : (
          <span
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg',
              'text-gray-400 bg-gray-100 cursor-not-allowed'
            )}
          >
            <Phone size={14} />
            WhatsApp
          </span>
        )}
      </div>
    </motion.div>
  );
}