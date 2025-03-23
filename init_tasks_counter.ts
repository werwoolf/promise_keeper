import * as anchor from "@coral-xyz/anchor";
import dotenv from "dotenv";

dotenv.config();
const provider = anchor.AnchorProvider.local();
anchor.setProvider(provider);
const program = anchor.workspace.promise_keeper;

(async () => {

    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("task_counter")],
        program.programId
    );

    const res = await program
        .methods
        .initTaskCounter()
        .accounts({
            counter: pda,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

    console.log(res)

})()
