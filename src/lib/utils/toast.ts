import { toast as sonnerToast, type ExternalToast } from 'sonner';

/**
 * Wrapper centralizado do Sonner.
 *
 * Centraliza estilos e comportamento padrão em um único lugar.
 * Evita importar Sonner direto nos módulos.
 *
 * @example
 * toast.success('Cliente salvo');
 * toast.error('Falha ao salvar');
 * toast.promise(api.save(), {
 *   loading: 'Salvando...',
 *   success: 'Salvo!',
 *   error: 'Erro ao salvar',
 * });
 */

const defaultOptions: ExternalToast = {
  duration: 4000,
};

export const toast = {
  success(message: string, options?: ExternalToast) {
    return sonnerToast.success(message, { ...defaultOptions, ...options });
  },

  error(message: string, options?: ExternalToast) {
    return sonnerToast.error(message, {
      ...defaultOptions,
      duration: 6000,
      ...options,
    });
  },

  info(message: string, options?: ExternalToast) {
    return sonnerToast.info(message, { ...defaultOptions, ...options });
  },

  warning(message: string, options?: ExternalToast) {
    return sonnerToast.warning(message, { ...defaultOptions, ...options });
  },

  loading(message: string, options?: ExternalToast) {
    return sonnerToast.loading(message, options);
  },

  message(message: string, options?: ExternalToast) {
    return sonnerToast(message, { ...defaultOptions, ...options });
  },

  /**
   * Wrapper para promises com loading/success/error automáticos.
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
  ) {
    return sonnerToast.promise(promise, messages);
  },

  dismiss(id?: string | number) {
    return sonnerToast.dismiss(id);
  },
};
