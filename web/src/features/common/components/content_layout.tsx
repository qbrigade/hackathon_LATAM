type ContentLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  variant?: 'normal' | 'wide',
};

export function ContentLayout({ children, variant, style, className, ...rest }: ContentLayoutProps) {
  if (variant === 'wide') {
    return (
      <div className={`w-full px-page ${className ?? ''}`} style={style} {...rest}>
        <div className='max-w-[90rem] m-auto h-full w-full'>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full px-page ${className ?? ''}`} style={style} {...rest}>
      <div className='max-w-[78rem] m-auto h-full w-full'>
        {children}
      </div>
    </div>
  );
}
