import React from 'react';

type ButtonVariant = 'white' | 'red' | 'hero';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  leading?: React.ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  type = 'button',
  disabled,
  style,
  className,
  leading,
  variant = 'white',
  ...rest
}: ButtonProps) {
  let color: string;
  let backgroundColor: string;
  let borderColor: string;

  switch (variant) {
    case 'hero':
      color = 'text-white';
      backgroundColor = 'bg-[#DD4141]';
      borderColor = 'border-[#A31818]';
      break;
    case 'white':
      color = 'text-gray-900';
      backgroundColor = 'bg-white';
      borderColor = 'border-gray-300';
      break;
    case 'red':
      color = 'text-white';
      backgroundColor = 'bg-primary';
      borderColor = 'border-[#A31818]';
      break;
    default:
      throw new Error(`Unknown Button variant: ${variant}`);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-5 rounded-lg min-h-10 cursor-pointer border ${color} ${backgroundColor} ${borderColor} ${className ?? ''}`}
      style={style}
      {...rest}
    >
      {
        leading && (
          <>
            <div className='flex items-center justify-between gap-1.5'>
              {leading}
              {children}
            </div>
          </>
        )
      }
      {
        !leading && children
      }
    </button>
  );
}
