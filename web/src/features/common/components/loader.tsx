import { LucideLoader } from 'lucide-react';

type LoaderProps = Parameters<typeof LucideLoader>[0] & {
  variant?: 'white' | 'gray',
};

export function Loader(props: LoaderProps) {
  let color;

  switch (props.variant) {
    case 'white':
      color = 'var(--color-white)';
      break;
    case 'gray':
      color = 'var(--color-gray-500)';
      break;
    default:
      color = 'var(--color-gray-500)';
  }

  return (
    <LucideLoader
      className={`animate-spin ${props.className}`}
      style={{
        color,
      }}
      size={24}
      strokeWidth={2.5}
      {...props}
    />
  );
}
