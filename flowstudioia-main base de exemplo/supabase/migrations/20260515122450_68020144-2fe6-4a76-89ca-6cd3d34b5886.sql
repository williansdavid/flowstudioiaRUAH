-- Adicionar coluna whatsapp_phone na tabela clients
ALTER TABLE public.clients ADD COLUMN whatsapp_phone TEXT;

-- Criar índice para busca rápida por telefone
CREATE INDEX idx_clients_whatsapp_phone ON public.clients(whatsapp_phone);
CREATE INDEX idx_whatsapp_messages_phone ON public.whatsapp_messages(phone);
CREATE INDEX idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);
