export const Avatar = ({
  src,
  alt = "Avatar",
  className = "",
  children,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={`relative inline-block rounded-full overflow-hidden ${className}`}>
    {src ? (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-xl">
        {children}
      </div>
    )}
  </div>
);
