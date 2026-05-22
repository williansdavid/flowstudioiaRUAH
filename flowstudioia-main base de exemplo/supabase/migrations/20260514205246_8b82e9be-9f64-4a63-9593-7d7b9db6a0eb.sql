
-- Roles enum + table (security best practice)
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'client');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security definer to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone');
  -- Default role: client
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Staff
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role_title TEXT,
  bio TEXT,
  avatar_url TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER staff_updated BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_minutes INT NOT NULL DEFAULT 60,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Clients (CRM)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  birthday DATE,
  notes TEXT,
  preferences TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Appointments
CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','completed','cancelled','no_show');

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  price NUMERIC(10,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX appointments_start_idx ON public.appointments(start_at);
CREATE INDEX appointments_staff_idx ON public.appointments(staff_id);
CREATE TRIGGER appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Finance
CREATE TYPE public.tx_type AS ENUM ('income','expense');
CREATE TABLE public.finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.tx_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT,
  description TEXT,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI messages (chat history)
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ai_messages_session_idx ON public.ai_messages(session_id, created_at);

-- Lead submissions from landing page contact form
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own; admins see all
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- user_roles: users read own; only admins manage
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Staff: anyone authenticated can view active; admins manage
CREATE POLICY "view staff" ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage staff" ON public.staff FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Services: public-ish (auth) read; admin manage
CREATE POLICY "view services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Clients: admins/staff manage; clients see own record
CREATE POLICY "staff view clients" ON public.clients FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR user_id = auth.uid());
CREATE POLICY "admin manage clients" ON public.clients FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

-- Appointments
CREATE POLICY "view appointments" ON public.appointments FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.staff s WHERE s.id = appointments.staff_id AND s.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.clients c WHERE c.id = appointments.client_id AND c.user_id = auth.uid())
);
CREATE POLICY "create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'client')
);
CREATE POLICY "update appointments" ON public.appointments FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.staff s WHERE s.id = appointments.staff_id AND s.user_id = auth.uid())
);
CREATE POLICY "delete appointments admin" ON public.appointments FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Finance: admin only
CREATE POLICY "admin finance" ON public.finance_transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AI messages: admin read all
CREATE POLICY "admin read ai" ON public.ai_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Leads: admin read; anyone (anon) insert via server fn (we'll use admin client)
CREATE POLICY "admin read leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Seed sample services & staff
INSERT INTO public.services (name, description, category, duration_minutes, price) VALUES
('Corte Feminino','Corte personalizado com finalização','Cabelo',60,120),
('Coloração','Coloração completa premium','Cabelo',120,250),
('Manicure','Cuidado completo das mãos','Unhas',45,60),
('Pedicure','Cuidado completo dos pés','Unhas',60,75),
('Design de Sobrancelhas','Modelagem e design','Sobrancelhas',30,50),
('Hidratação Profunda','Tratamento capilar reparador','Cabelo',75,180);

INSERT INTO public.staff (full_name, role_title, bio) VALUES
('Camila Rodrigues','Hair Stylist Senior','Especialista em coloração e cortes modernos com 10 anos de experiência.'),
('Beatriz Lima','Manicure & Nail Art','Designer de unhas premiada, foco em nail art autoral.'),
('Marina Costa','Esteticista','Especialista em sobrancelhas e tratamentos faciais.');
