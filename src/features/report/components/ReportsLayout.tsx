// src/features/report/components/ReportsLayout.tsx
import { useState } from 'react';
import { BarChart3, ShoppingBag, Users, Settings2 } from 'lucide-react';
import { FinanceTab } from './FinanceTab';
import { SalesTab } from './SalesTab';
import { StaffTab } from './StaffTab';
import { OperationalTab } from './OperationalTab';

const TABS = [
  { key: 'financial', label: 'Financeiro', icon: BarChart3 },
  { key: 'sales', label: 'Vendas & Serviços', icon: ShoppingBag },
  { key: 'staff', label: 'Profissionais', icon: Users },
  { key: 'operations', label: 'Operacional', icon: Settings2 },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface ReportsLayoutProps {
  children?: React.ReactNode;
}

export function ReportsLayout({ children }: ReportsLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('financial');

  return (
    <div className="space-y-6 pb-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o desempenho do seu negócio com dados em tempo real.
        </p>
      </div>

      {/* Abas */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === 'financial' && <FinanceTab />}
      {activeTab === 'sales' && <SalesTab />}
      {activeTab === 'staff' && <StaffTab />}
      {activeTab === 'operations' && <OperationalTab />}

      {children}
    </div>
  );
}