import classNames from 'classnames';
import * as React from 'react';
import {Spinner} from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    loading?: boolean;
    onClick?: () => void;
}

export const Button = ({
                           children,
                           className,
                           loading,
                           disabled,
                           onClick,
                           ...rest
                       }: ButtonProps) => {
    return (
        <button
            className={classNames(
                'min-w-[73px] mih-h-[40px] transition-all',
                'text-sm text-center leading-[22px] select-none font-medium',
                'focus:outline-gray-900 focus:outline outline-1 outline-offset-1',
                "text-white bg-gray-900 hover:bg-gray-700",
                'rounded text-gray-900 disabled:bg-white hover:bg-gray-200 disabled:opacity-36 border border-solid',
                className,
            )}
            disabled={disabled || (loading && disabled === undefined)}
            onClick={!disabled ? onClick : undefined}
            {...rest}
        >
            {loading ? <Spinner variant="white" size="sm"/> : children}
        </button>
    );
};
