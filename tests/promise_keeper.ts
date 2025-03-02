import * as anchor from "@coral-xyz/anchor";

describe("promise_keeper", () => {
    const provider = anchor.AnchorProvider.local();

    anchor.setProvider(provider);

    // const id = Math.random().toString();
    const program = anchor.workspace.promise_keeper;
    // const counterSeed = [
    //     anchor.utils.bytes.utf8.encode("task"),
    //     anchor.utils.bytes.utf8.encode(id),
    // ];


    // let counterPubkey;
    //
    // before(async () => {
    //     [counterPubkey] = anchor.web3.PublicKey.findProgramAddressSync(counterSeed, program.programId);
    // });

    it("Is runs the constructor", async () => {
        const name = "Wake up 7";
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

    // it("Executes a method on the program", async () => {
    //     await program.methods
    //         .increment()
    //         .accounts({
    //             counter: counterPubkey,
    //             authority: provider.wallet.publicKey,
    //         })
    //         .rpc();
    //
    //     const counterAccount = await program.account.counter.fetch(counterPubkey);
    //     assert.ok(counterAccount.count.eq(new anchor.BN(1)));
    // });

    it('should all', async () => {
        console.log(await program.account.task.all())
    });
});