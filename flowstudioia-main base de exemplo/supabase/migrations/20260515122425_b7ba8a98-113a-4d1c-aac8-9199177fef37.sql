-- Criar função de atualização de timestamp se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tabela para log de mensagens do WhatsApp
CREATE TABLE public.whatsapp_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    phone TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'received' CHECK (status IN ('received', 'sent', 'delivered', 'read', 'failed')),
    external_id TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações do WhatsApp
CREATE TABLE public.whatsapp_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    instance_name TEXT,
    api_url TEXT,
    api_key TEXT,
    default_message TEXT DEFAULT 'Olá! Obrigada por entrar em contato com a FlowStudio AI. Como posso ajudar?',
    auto_reply_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_messages: administradores podem ver tudo
CREATE POLICY "Admins can view all whatsapp messages"
ON public.whatsapp_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert whatsapp messages"
ON public.whatsapp_messages
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas para whatsapp_settings: administradores podem gerenciar
CREATE POLICY "Admins can view whatsapp settings"
ON public.whatsapp_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update whatsapp settings"
ON public.whatsapp_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert whatsapp settings"
ON public.whatsapp_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at em whatsapp_settings
CREATE TRIGGER update_whatsapp_settings_updated_at
BEFORE UPDATE ON public.whatsapp_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
