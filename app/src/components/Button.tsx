import classNames from 'classnames';
import * as React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'plain';
  loading?: boolean;
  active?: boolean;
  textAlign?: 'center' | 'left' | 'right';
  hideContentDuringLoading?: boolean;
  icon?: string;
  onClick?: (() => void | Promise<void>) | ((e?: any | undefined) => void | Promise<void>);
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  loading,
  textAlign = 'center',
  disabled,
  hideContentDuringLoading = false,
  icon,
  active,
  onClick,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={classNames(
        'min-w-[73px] mih-h-[40px] transition-all',
        'text-sm leading-[22px] select-none font-medium',
        'flex flex-row items-center focus:outline-gray-900 focus:outline outline-1 outline-offset-1',
        'rounded',
        {
          'text-white bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 ': variant === 'primary',
          'text-gray-900 disabled:bg-white hover:bg-gray-200 disabled:opacity-36 border border-solid':
            variant === 'secondary',
          'border-gray-200': variant === 'secondary' && !className?.includes('border-'),
          'text-blue-500 hover:bg-blue-700/[.06] focus:bg-blue-700/[.12] disabled:text-gray-900 disabled:opacity-36':
            variant === 'plain',
          'justify-center text-center': textAlign === 'center',
          'justify-start text-left': textAlign === 'left',
          'justify-end text-right': textAlign === 'right',
          'w-full': !className?.includes('w-'),
          'py-[9px]': !className?.includes('py-'),
          'px-4': !className?.includes('px-'),
          'outline-gray-900 outline': active === true,
        },
        className,
      )}
      disabled={disabled || (loading && disabled === undefined)}
      onClick={!disabled ? onClick : undefined}
      {...rest}
    >
      {loading && (
        <Spinner
          variant="white"
          size="sm"
          className={classNames({
            'mr-0': hideContentDuringLoading,
          })}
        />
      )}
      {!hideContentDuringLoading && !loading && (
        <>
          {icon && <img src={icon} alt="Loading..." className="w-[18px] h-[18px] mr-2" />}
          {children}
        </>
      )}
    </button>
  );
};
