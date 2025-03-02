import assert from "node:assert";
import * as anchor from "@coral-xyz/anchor";

describe("promise_keeper", () => {
    const provider = anchor.AnchorProvider.local();

    anchor.setProvider(provider);

    const program = anchor.workspace.promise_keeper;
    const counterSeed = anchor.utils.bytes.utf8.encode("counter");

    let counterPubkey;

    before(async () => {
        [counterPubkey] = await anchor.web3.PublicKey.findProgramAddress(
            [counterSeed],
            program.programId
        );
    });

    it("Is runs the constructor", async () => {
        await program.methods
            .initialize()
            .accounts({
                counter: counterPubkey,
                authority: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        const counterAccount = await program.account.counter.fetch(counterPubkey);

        assert.ok(counterAccount.count.eq(new anchor.BN(0)));
    });

    it("Executes a method on the program", async () => {
        await program.methods
            .increment()
            .accounts({
                counter: counterPubkey,
                authority: provider.wallet.publicKey,
            })
            .rpc();

        const counterAccount = await program.account.counter.fetch(counterPubkey);
        assert.ok(counterAccount.count.eq(new anchor.BN(1)));
    });
});