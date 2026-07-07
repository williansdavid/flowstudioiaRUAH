import { useState } from 'react';
import { Plus } from 'lucide-react';
import { NewExpenseModal } from './NewExpenseModal';

export function NewExpenseButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-sm font-medium text-white shadow-md shadow-orange-500/20 transition-all duration-200 active:scale-95 hover:bg-orange-600"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nova despesa
      </button>
      <NewExpenseModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
