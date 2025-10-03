import { Plus } from 'lucide-react';
import { Button } from './button';

type CreateButtonProps = {
  onClick: () => void,
  children: React.ReactNode,
};

export function CreateButton({ onClick, children }: CreateButtonProps) {
  return (
    <Button
      variant='red'
      leading={<Plus size={20} />}
      onClick={onClick}
      style={{
        paddingLeft: 8,
        paddingRight: 12,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{children}</span>
    </Button>
  );
}
