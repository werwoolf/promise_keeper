import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ModalProvider} from "./components/ModalProvider.tsx";
import {WalletProvider} from "@solana/wallet-adapter-react";
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui';
import {PhantomWalletAdapter, SolflareWalletAdapter} from '@solana/wallet-adapter-wallets'
import "@solana/wallet-adapter-react-ui/styles.css"
import {PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import {QueryClient} from "@tanstack/react-query";
import {createSyncStoragePersister} from "@tanstack/query-sync-storage-persister";
import {create} from "kubo-rpc-client";


// todo:
//  loaders
//  filters
//  popups error/success
//  get idl and types automatically

const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
];

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
})

export const ipfs = create({url: import.meta.env.VITE_IPFS_URL});

const persister = createSyncStoragePersister({storage: window.localStorage,})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{persister, buster: Math.random().toString()}}
        >
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <ModalProvider>
                        <App/>
                    </ModalProvider>
                </WalletModalProvider>
            </WalletProvider>
        </PersistQueryClientProvider>
    </StrictMode>,
)


