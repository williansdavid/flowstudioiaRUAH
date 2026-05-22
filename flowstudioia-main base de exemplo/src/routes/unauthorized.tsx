import { createFileRoute, Link } from "@tanstack/react-router";

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold text-red-500">Acesso Negado</h1>
      <p className="text-gray-600">
        Você não tem permissão para acessar esta página.
      </p>
      <Link to="/" className="text-blue-500 underline">
        Voltar para o início
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});
