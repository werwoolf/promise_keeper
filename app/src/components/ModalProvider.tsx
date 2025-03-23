import { FC, ReactNode, createContext, useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ModalProviderProps {
  children: ReactNode;
}

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}

type ModalProps<T> = T & BaseModalProps;

type ModalObject<T> = {
  Modal: FC<ModalProps<T>>;
  props: T;
  open: boolean;
  id: string;
};

export interface ModalProviderContext {
  openModal<T extends BaseModalProps>(
    modal: FC<ModalProps<T>>,
    props?: Omit<T, 'open' | 'onClose'>,
  ): void;
  onCloseAll: () => void;
}

export const ModalProviderContext = createContext<ModalProviderContext>({
  openModal(): void {
    return;
  },
  onCloseAll(): void {
    return;
  },
});

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<ModalObject<any>[]>([]);

  const handleOpenModal: ModalProviderContext['openModal'] = useCallback(
    <T extends BaseModalProps>(
      Modal: FC<ModalProps<T>>,
      props: Omit<ModalProps<T>, keyof BaseModalProps>,
    ) => {
      setModals(modals => [...modals, { Modal, open: true, id: uuidv4(), props }]);
    },
    [],
  );

  const handleCloseModal = useCallback((id: string) => {
    setModals(modals => modals.map(modal => (id === modal.id ? { ...modal, open: false } : modal)));

    setTimeout(() => {
      setModals(modals => modals.filter(modal => id !== modal.id));
    }, 500);
  }, []);

  const handleCloseAllModal = useCallback(() => {
    setModals(modals => modals.map(modal => ({ ...modal, open: false })));

    setTimeout(() => {
      setModals([]);
    }, 500);
  }, []);

  return (
    <ModalProviderContext.Provider
      value={{ openModal: handleOpenModal, onCloseAll: handleCloseAllModal }}
    >
      {children}
      {modals.map(({ Modal, id, open, props }) => (
        <Modal {...props} key={id} open={open} onClose={() => handleCloseModal(id)} />
      ))}
    </ModalProviderContext.Provider>
  );
};
