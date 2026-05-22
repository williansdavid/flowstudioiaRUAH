import { Navigate } from "@tanstack/react-router";
import { useAuth, type UserRole } from "@/hooks/useAuth";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function RouteGuard({
  children,
  requiredRole,
  fallback,
}: RouteGuardProps) {
  const { data, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground text-sm">Carregando...</span>
      </div>
    );
  }

  // Sem sessão → redireciona para login
  if (!data?.session) {
    return <Navigate to="/login" />;
  }

  // Verifica role se necessário
  if (requiredRole && data.role !== requiredRole) {
    return fallback ? <>{fallback}</> : <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
