import * as anchor from "@coral-xyz/anchor";
import dotenv from "dotenv";

// todo tests: create task with wrong data
//  create task with correct data
//  get all tasks
//  take own task
//  take someone else's task
//  take already taken task
//  finish own task
//  finish someone else's task
//  finish task with unappropriated status
//  finish stale task
//  vote task
//  double vote task
//  vote own task
//  vote task with wrong status
//  validate task creation data

describe("promise_keeper", () => {
    dotenv.config();
    const provider = anchor.AnchorProvider.local();

    anchor.setProvider(provider);
    const user = new anchor.web3.Keypair();

    const program = anchor.workspace.promise_keeper;

    it("Should create task", async () => {
        const name = "Run 5 kilometer";
        const taskSeed = [
            anchor.utils.bytes.utf8.encode("task"),
            anchor.utils.bytes.utf8.encode(name),
        ];
        let [taskPubKey] = anchor.web3.PublicKey.findProgramAddressSync(taskSeed, program.programId);

        await program.methods
            .createTask(name, "You must run a kilometer to prove your power", 3600)
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