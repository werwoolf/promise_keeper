import { Dialog, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { FC, Fragment } from 'react';
import CloseIcon from '../assets/close-icon.svg';

export interface ModalContentWrapperProps {
  open: boolean;
  children: React.ReactNode;
  title: string | React.ReactNode;
  onClose: () => void;
  classes?: {
    dialogPanel?: string;
    children?: string;
  };
}

export const ModalContentWrapper: FC<ModalContentWrapperProps> = ({
  open,
  title,
  children,
  classes,
  onClose,
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog className="relative z-[2]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  'w-full max-w-xl transform overflow-visible rounded-xl bg-white text-left align-middle shadow-xl transition-all',
                  classes?.dialogPanel,
                )}
              >
                <Dialog.Title
                  as="div"
                  className="w-full flex items-start justify-between px-3 sm:px-6 pt-5"
                >
                  <div className="flex gap-3 items-center">
                    <span
                      className="font-medium font-serif text-[24px] leading-[32px] break-words"
                      style={{ wordBreak: 'break-word' }}
                    >
                      {title}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex-none hover:opacity-80 hover:cursor-pointer"
                  >
                    <img src={CloseIcon} alt="Close" />
                  </button>
                </Dialog.Title>
                <div
                  className={classNames(
                    {
                      'pb-5': !classes?.children?.includes('pb-'),
                      'p-3 sm:p-6': !classes?.children?.includes('p-'),
                    },
                    classes?.children,
                  )}
                >
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
