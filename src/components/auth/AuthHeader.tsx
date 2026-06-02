import { studioConfig } from '@/_legacy/admConfig/studio.config';

export interface AuthHeaderProps {
  title: string;
  description?: string;
}

/**
 * Logo + tÃ­tulo + descriÃ§Ã£o opcional no topo do form.
 */
export function AuthHeader({ title, description }: AuthHeaderProps) {
  const { branding, name } = studioConfig;

  return (
    <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
      <img
        src={branding.logoUrl}
        alt={`Logo ${name}`}
        className="mb-6 h-14 w-14 rounded-full object-cover ring-1 ring-neutral-200"
      />
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-neutral-600">{description}</p>
      ) : null}
    </div>
  );
}
