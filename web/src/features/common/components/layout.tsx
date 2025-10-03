import '@common/styles/layout.scss';

type LayoutProps = React.HTMLAttributes<HTMLElement>;

export function Layout({ children, className, ...rest }: LayoutProps) {
  return (
    <div id="layout-wrapper" className={className} {...rest}>
      {children}
    </div>
  );
}
