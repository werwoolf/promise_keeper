import {useMemo} from "react";
import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
import {useWallet} from "@solana/wallet-adapter-react";
import {PromiseKeeper} from "../../types/promise_keeper.ts";
import idl from "../../idl/promise_keeper.json";

export const useBlockchain = () => {
    const wallet = useWallet();

    const connection = useMemo(() => new anchor.web3.Connection(import.meta.env.VITE_SOLANA_ENDPOINT, "confirmed"), [])

    const program = useMemo(() => {
        const {signTransaction, signAllTransactions, publicKey} = wallet;

        if (!signTransaction || !signAllTransactions || !publicKey) return null;

        const provider = new AnchorProvider(connection, {signTransaction, signAllTransactions, publicKey});
        anchor.setProvider(provider);

        return new Program<PromiseKeeper>(idl, provider);
    }, [connection, wallet])


    return {
        connection, program, wallet
    };
}
