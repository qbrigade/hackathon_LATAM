type NoResultsProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  icon: React.ReactNode
};

export function Admonition({ title, icon, ...rest }: NoResultsProps) {
  return (
    <div {...rest} className={`flex flex-col justify-center gap-2 w-full h-48 bg-gray-100 ${rest.className}`}>
      <div className='flex items-center justify-center'>
        {icon}
      </div>
      <p className='flex items-center justify-center text-center text-gray-500 w-full'>
        {title ?? 'No se encontraron resultados'}
      </p>
    </div>
  );
}
