export const Card = ({
  children,
  className = "",
  onClick
}: {
  children: React.ReactNode;
  className?: string; onClick?: () => void
}) => (
  <div onClick={onClick} className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>{children}</div>
)
