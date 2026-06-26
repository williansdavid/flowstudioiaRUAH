import { createFileRoute } from '@tanstack/react-router';
import { ProductsList } from '@/features/products';

export const Route = createFileRoute('/_authed/admin/produtos')({
  staticData: { title: 'Produtos' },
  component: ProductsList,
});