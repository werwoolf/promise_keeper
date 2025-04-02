import {useMutation, useQuery} from '@tanstack/react-query';
import {useBlockchain} from "../hooks/useBlockchain.ts";
import {queryClient} from "../main.tsx";
import {PublicKey} from "@solana/web3.js";
import {CreateTaskData, FinishTaskData, VoteTaskData} from "../types.ts";

const TASKS_LIST_QK = "tasks-list-query-key";

export const useGetTasksQuery = (disabled = false) => {
    const {program} = useBlockchain()

    return useQuery({
        queryKey: [TASKS_LIST_QK],
        staleTime: 1000 * 60 * 60 * 3,
        queryFn: async () => {
            return await program!.account.task.all()
        },
        retry: 2,
        enabled: !!program || !disabled,
    });
};

export const useTakeTaskMutation = () => {
    const {program, wallet, connection} = useBlockchain()

    return useMutation({
        mutationFn: async (taskPubKey: PublicKey) => {
            if (!wallet?.publicKey || !wallet?.signTransaction) { // todo: error popup
                return {
                    error: {
                        status: 'UNAUTHORIZED',
                        data: 'Wallet not connected or missing signing method',
                    },
                };
            }
            const transaction = await program!.methods
                .takeTask()
                .accounts({user: wallet.publicKey, task: taskPubKey})
                .transaction();
            const latestBlockhash = await connection.getLatestBlockhash();

            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = wallet.publicKey;

            const signedTransaction = await wallet.signTransaction(transaction);

            const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());

            await connection.confirmTransaction({signature: txSignature, ...latestBlockhash,});

            return {data: txSignature};
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [TASKS_LIST_QK]});
        },
    });
};

export const useCreateTaskMutation = () => {
    const {program, wallet, connection} = useBlockchain()

    return useMutation({
        mutationFn: async ({name, description, timeToSolveS}: CreateTaskData) => {

            if (!wallet?.publicKey || !wallet?.signTransaction) { // todo: error popup
                return {
                    error: {
                        status: 'UNAUTHORIZED',
                        data: 'Wallet not connected or missing signing method',
                    },
                };
            }
            const transaction = await program!.methods
                .createTask(name, description, timeToSolveS)
                .accounts({authority: wallet.publicKey})
                .transaction();

            const latestBlockhash = await connection.getLatestBlockhash();

            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = wallet.publicKey;

            const signedTransaction = await wallet.signTransaction(transaction);
            const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());

            await connection.confirmTransaction({signature: txSignature, ...latestBlockhash,});

            return {data: txSignature};
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [TASKS_LIST_QK]});
        },
    });
};

export const useFinishTaskMutation = () => {
    const {program, wallet, connection} = useBlockchain()

    return useMutation({
        mutationFn: async ({proofCID, taskPubKey}: FinishTaskData) => {
            if (!wallet?.publicKey || !wallet?.signTransaction) { // todo: error popup
                return {
                    error: {
                        status: 'UNAUTHORIZED',
                        data: 'Wallet not connected or missing signing method',
                    },
                };
            }
            const transaction = await program!.methods
                .finishTask(proofCID)
                .accounts({user: wallet.publicKey, task: taskPubKey})
                .transaction();

            const latestBlockhash = await connection.getLatestBlockhash();
            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = wallet.publicKey;
            const signedTransaction = await wallet.signTransaction(transaction);

            const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());

            await connection.confirmTransaction({signature: txSignature, ...latestBlockhash,});

            return {data: txSignature};
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [TASKS_LIST_QK]});
        },
    });
};

export const useVoteTaskMutation = () => {
    const {program, wallet, connection} = useBlockchain()

    return useMutation({
        mutationFn: async (voteTaskData: VoteTaskData) => {
            if (!wallet?.publicKey || !wallet?.signTransaction) { // todo: error popup
                return {
                    error: {
                        status: 'UNAUTHORIZED',
                        data: 'Wallet not connected or missing signing method',
                    },
                };
            }
            const transaction = await program!.methods
                .voteTask(voteTaskData.approve)
                .accounts({user: wallet.publicKey, task: voteTaskData.taskPubKey})
                .transaction();
            const latestBlockhash = await connection.getLatestBlockhash();

            transaction.recentBlockhash = latestBlockhash.blockhash;
            transaction.feePayer = wallet.publicKey;

            const signedTransaction = await wallet.signTransaction(transaction);
            const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());

            await connection.confirmTransaction({signature: txSignature, ...latestBlockhash,});

            return {data: txSignature};
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [TASKS_LIST_QK]});
        },
    });
};
