import { Search } from 'lucide-react';
import { Admonition } from './admonition';

type NoResultsProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export function NoResults({ title, ...rest }: NoResultsProps) {
  return (
    <Admonition title={title} icon={<Search />} {...rest} />
  );
}
