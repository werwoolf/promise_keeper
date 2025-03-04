import * as anchor from "@coral-xyz/anchor";
import dotenv from "dotenv";

describe("promise_keeper", () => {
    dotenv.config();
    const provider = anchor.AnchorProvider.local();

    anchor.setProvider(provider);
    const user = new anchor.web3.Keypair();

    const program = anchor.workspace.promise_keeper;

    it("Should create task", async () => {
        const name = "Push ups6";
        const taskSeed = [
            anchor.utils.bytes.utf8.encode("task"),
            anchor.utils.bytes.utf8.encode(name),
        ];
        let [taskPubKey] = anchor.web3.PublicKey.findProgramAddressSync(taskSeed, program.programId);

        await program.methods
            .createTask(name, "Bla bla description", 1_000_000)
            .accounts({
                task: taskPubKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const taskAccount = await program.account.task.fetch(taskPubKey);
        console.log(taskAccount)
    });

    it('Should get all tasks', async () => {
        console.log((await program.account.task.all())[0])
    });

    it('Should take task', async () => {
        const task = (await program.account.task.all())[0];

        await program.methods
            .takeTask()
            .accounts({user: user.publicKey, task: task.publicKey})
            .signers([user])
            .rpc();

        const taskAccount = await program.account.task.fetch(task.publicKey);
        console.log(taskAccount)
    });

    it('Should finish task', async () => {
        const task = (await program.account.task.all())[0];

        const res = await program.methods
            .voteTask("QQ123HASH")
            .accounts({user: user.publicKey, task: task.publicKey})
            .signers([user])
            .rpc();

        console.log(res);
    });

    it('Should vote task', async () => {
        const task = (await program.account.task.all())[0];
        console.log(task)
        const res = await program.methods
            .voteTask(new anchor.BN(1))
            .accounts({user: user.publicKey, task: task.publicKey})
            .signers([user])
            .rpc();

        console.log(res);
    });
});