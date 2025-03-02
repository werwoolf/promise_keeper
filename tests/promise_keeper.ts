import * as anchor from "@coral-xyz/anchor";

describe("promise_keeper", () => {
    const provider = anchor.AnchorProvider.local();

    anchor.setProvider(provider);
    const user = new anchor.web3.Keypair();

    const program = anchor.workspace.promise_keeper;

    it("Is runs the constructor", async () => {
        const name = "Wake up";
        const counterSeed = [
            anchor.utils.bytes.utf8.encode("task"),
            anchor.utils.bytes.utf8.encode(name),
        ];
        let [counterPubKey] = anchor.web3.PublicKey.findProgramAddressSync(counterSeed, program.programId);

        await program.methods
            .createTask(name, "Bla bla description", 1_000_000)
            .accounts({
                counter: counterPubKey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const counterAccount = await program.account.task.fetch(counterPubKey);
        console.log(counterAccount)
        // assert.ok(counterAccount.count.eq(new anchor.BN(0)));
    });

    it('should all', async () => {
        console.log(await program.account.task.all())
    });

    it('should take task', async () => {
        const task = (await program.account.task.all())[1];

        const res = await program.methods
            .takeTask()
            .accounts({user: user.publicKey, task: task.publicKey})
            .signers([user])
            .rpc();

        console.log(res);
    });
});