import {useBlockchain} from "../hooks/useBlockchain.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import * as anchor from "@coral-xyz/anchor";
import {queryClient} from "../main.tsx";
import {UpdateUserProfileData} from "../types.ts";

const USER_PROFILE_QK = "user-profile-key";

export const useGetProfileQuery = (disabled = false) => {
    const {program, wallet} = useBlockchain()

    return useQuery({
        queryKey: [USER_PROFILE_QK],
        staleTime: 1000 * 60 * 60 * 3,
        queryFn: async () => {
            if (!wallet?.publicKey || !wallet?.signTransaction || !program) {// todo: error popup
                throw new Error("Wallet not connected or missing signing method");
            }

            const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
                [anchor.utils.bytes.utf8.encode("user"), wallet.publicKey.toBuffer()],
                program?.programId
            );

            return await program.account.user.fetch(pda)
        },
        retry: 2,
        enabled: !!program && !disabled,
    });
};

export const useUpdateProfileMutation = () => {
    const {program, wallet, connection} = useBlockchain()

    return useMutation({
        mutationFn: async ({nickname, birthdate, avatarHash}: UpdateUserProfileData) => {
            if (!wallet?.publicKey || !wallet?.signTransaction) { // todo: error popup
                return {
                    error: {
                        status: 'UNAUTHORIZED',
                        data: 'Wallet not connected or missing signing method',
                    },
                };
            }
            const transaction = await program!.methods
                .createUser(nickname, birthdate, avatarHash)
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
            await queryClient.invalidateQueries({queryKey: [USER_PROFILE_QK]});
        },
    });
}
