// src/features/report/types.ts
export interface CashFlowRow {
  month: string;       // YYYY-MM
  income: number;
  expense: number;
  netBalance: number;  // income - expense
}

export interface TopServiceRow {
  serviceId: string;
  serviceName: string;
  quantity: number;
  revenue: number;
  percentage: number;  // % do faturamento total
}

export interface TopProductRow {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface StaffPerformanceRow {
  staffId: string;
  staffName: string;
  staffColor: string | null;
  staffAvatarUrl: string | null;
  revenue: number;
  commission: number;
  appointmentsCount: number;
  occupancyRate: number | null;  // %
}

export interface OccupancyRateRow {
  date: string;           // YYYY-MM-DD
  totalSlots: number;
  filledSlots: number;
  occupancyRate: number;  // %
  cancellations: number;
  noShows: number;
}

export interface NewVsReturningRow {
  month: string;          // YYYY-MM
  newClients: number;
  returningClients: number;
  totalClients: number;
}
export interface ExpenseByCategoryRow {
  category: string;
  total: number;
  percentage: number;
}

export interface CashFlowDailyRow {
   /** YYYY-MM-DD */
   date: string;
   income: number;
   expense: number;
   netBalance: number;
 }

export interface OperationalOverviewRow {
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  pendingAppointments: number;
}