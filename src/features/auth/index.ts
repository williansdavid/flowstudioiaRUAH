// src/features/auth/index.ts


// Types
export type { UserRole, AuthProfile, SessionData } from './types';
export { ADMIN_ROLES, canAccessAdmin } from './types';

// Queries
export { authKeys, sessionQueryOptions } from './queries';

// Hooks
export {
  useSession,
  useSignIn,
  useSignOut,
  useRequestPasswordReset,
  useUpdatePassword,
  useEstablishRecoverySession,
} from './hooks';

// Components — layouts (montados pelas rotas)
export { LoginSplitLayout } from './components/login/LoginSplitLayout';
export { ForgotPasswordLayout } from './components/login/ForgotPasswordLayout';
export { ResetPasswordLayout } from './components/login/ResetPasswordLayout';

// Internos (NAO exportados): LoginForm, ForgotPasswordForm,
// ResetPasswordForm, LoginBrandPanel - detalhe dos layouts.