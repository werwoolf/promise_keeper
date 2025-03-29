import * as anchor from "@coral-xyz/anchor";
import dotenv from "dotenv";
import {BN} from "@coral-xyz/anchor";
import {expect} from "chai";
import {get} from "lodash";

const validCID = "Qmc4YSiThkGVmKxzshZHCfgpLaCVBRuRzMDkqApXxZBwzG";

describe("promise_keeper_task", () => {
    dotenv.config();
    const provider = anchor.AnchorProvider.local();

    anchor.setProvider(provider);
    const user = new anchor.web3.Keypair();

    const getTasksCounterPDA = () => {
        const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
            [anchor.utils.bytes.utf8.encode("task_counter")],
            program.programId
        );

        return pda;
    }

    const getNextTaskPDA = async () => {
        const tasksCounterPDA = getTasksCounterPDA();
        const taskCounter = await program.account.tasksCounter.fetch(tasksCounterPDA);

        const taskSeed = [Buffer.from("task"), taskCounter.data.toArrayLike(Buffer, "le", 8)];

        const [taskPDA] = anchor.web3.PublicKey.findProgramAddressSync(taskSeed, program.programId);

        return taskPDA;
    }

    const program = anchor.workspace.promise_keeper;

    // it('Should find counter account', async () => {
    //     const pda = getTasksCounterPDA();
    //     const counterAccount = await program.account.tasksCounter.fetch(pda);
    //
    //     expect(counterAccount).to.be.an('object');
    //     expect(counterAccount).to.have.property('data').that.is.instanceof(BN);
    // });
    //
    // it('Should update task counter', async () => {
    //     const pda = getTasksCounterPDA();
    //
    //     const initCounterAccount = await program.account.tasksCounter.fetch(pda);
    //     const initCounter = initCounterAccount.data.toNumber();
    //
    //     await program.methods.createTask("name", "description", 3600)
    //         .accounts({authority: provider.wallet.publicKey})
    //         .rpc();
    //
    //     const counterAccount = await program.account.tasksCounter.fetch(pda);
    //     const counter = counterAccount.data.toNumber();
    //
    //     expect(counter - initCounter).to.equal(1);
    // });
    //
    // it('Should not create task with invalid data', async () => {
    //     const wrongSets: Array<[string, string, number]> = [
    //         ["na", "description", 3600], // short name
    //         ["name", "de", 3600], // short description
    //         ["name", "description", 3599], // short time to solve,
    //     ];
    //
    //     for await (const set of wrongSets) {
    //         const [name, description, timeToSolve] = set;
    //         try {
    //             await program.methods.createTask(name, description, timeToSolve)
    //                 .accounts({authority: provider.wallet.publicKey})
    //                 .rpc();
    //
    //             throw new Error(`Program should fail with values: ${set.join(",")}`);
    //         } catch (e) {
    //             expect(get(e, "error.errorCode.code", "")).to.equal("InvalidData");
    //         }
    //     }
    // });
    //
    // it('Should create task with valid data', async () => {
    //     const dataSets: Array<[string, string, number]> = [
    //         ["Some long task name", "description", 36000],
    //         ["QWE", "Some very long description for task", 9999],
    //         ["Name", "description", 3600],
    //     ];
    //
    //     for await (const set of dataSets) {
    //         const [name, description, timeToSolveS] = set;
    //         const taskPDA = await getNextTaskPDA();
    //
    //         await program.methods.createTask(name, description, timeToSolveS)
    //             .accounts({authority: provider.wallet.publicKey})
    //             .rpc();
    //
    //         const task = await program.account.task.fetch(taskPDA);
    //
    //         expect(task).to.deep.equal({
    //             name,
    //             description,
    //             dueDateS: null,
    //             timeToSolveS,
    //             userId: null,
    //             imgProofHash: null,
    //             status: {pending: {}},
    //             approveVotes: [],
    //             disapproveVotes: []
    //         });
    //     }
    // });
    //
    // it('Should get all tasks', async () => {
    //     const tasks = await program.account.task.all();
    //     expect(tasks).to.be.an('array');
    //
    //     tasks.forEach(({account}) => {
    //         expect(account).to.have.property('name').that.is.a('string');
    //         expect(account).to.have.property('description').that.is.a('string');
    //         expect(account).to.have.property('dueDateS').satisfy(d => d instanceof BN || d === null);
    //         expect(account).to.have.property('timeToSolveS').that.is.a('number');
    //         expect(account).to.have.property('userId').satisfy(d => d instanceof anchor.web3.PublicKey || d === null);
    //         expect(account).to.have.property('imgProofHash').satisfy(h => typeof h === "string" || h === null);
    //         expect(account).to.have.property('status').that.is.an('object');
    //         expect(account).to.have.property('approveVotes').that.is.an('array').with.lengthOf.at.most(9);
    //         expect(account).to.have.property('disapproveVotes').that.is.an('array').with.lengthOf.at.most(9);
    //     });
    // });

    it('Should take task', async () => {
        const name = "Will be taken";
        const description = "test task";
        const timeToSolveS = 3600;

        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask(name, description, timeToSolveS)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        const task = await program.account.task.fetch(taskPDA);

        expect(task).to.have.property('name').that.is.a('string').and.equals(name);
        expect(task).to.have.property('description').that.is.a('string').and.equals(description);
        expect(task).to.have.property('dueDateS').that.is.instanceof(BN);
        expect(task).to.have.property('timeToSolveS').that.is.a('number').and.equals(timeToSolveS);
        expect(task).to.have.property('userId').instanceof(anchor.web3.PublicKey).satisfy(id => id.toString() === user.publicKey.toString());
        expect(task).to.have.property('imgProofHash').that.is.equals(null);
        expect(task).to.have.property('status').that.includes.keys('inProgress');
        expect(task).to.have.property('approveVotes').that.is.an('array').with.length(0);
        expect(task).to.have.property('disapproveVotes').that.is.an('array').with.length(0);

    });

    it('Should not take already taken task', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        const task = await program.account.task.fetch(taskPDA);

        expect(task).to.have.property('status').that.includes.keys('inProgress');

        try {
            await program.methods.takeTask()
                .accounts({user: user.publicKey, task: taskPDA})
                .signers([user])
                .rpc();
            throw new Error("Must not be successful")
        } catch (e) {
            expect(get(e, "error.errorCode.code", "")).to.equal("TaskAlreadyTaken");
        }
    });

    it('Should finish task', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        await program.methods.finishTask(validCID)
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        const task = await program.account.task.fetch(taskPDA);

        expect(task).to.have.property('status').that.includes.keys('voting');
        expect(task).to.have.property('imgProofHash').that.equals(validCID);
    });

    it('Should not finish task with wrong image proof hash', async () => {
        const wrongCIDs = [
            "Qmc4YSiThkGVmKxzshZHCfgpLaCVBRuRzMDkqApXxZBwz",
            "",
            "Qmc4YSi ThkGVmKxzshZHCfgpL aCVBRuRzMDkqApXxZBwzG",
            "Qmc4YSiThkGVmKxzshZHCfgpLaCVBRuRzMDkqApXxZBwzG1 asd",
            "asd",
            "123123",
        ];
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();


        for await (const CID of wrongCIDs) {
            try {
                await program.methods.finishTask(CID)
                    .accounts({user: user.publicKey, task: taskPDA})
                    .signers([user])
                    .rpc();

                throw new Error(`Program should fail with value: ${CID}`);
            } catch (e) {
                expect(get(e, "error.errorCode.code", "")).to.equal("InvalidData");
            }
        }
    });

    it('Should not finish someones else task', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();

        const doer = new anchor.web3.Keypair();

        await program.methods.takeTask()
            .accounts({user: doer.publicKey, task: taskPDA})
            .signers([doer])
            .rpc();

        const task = await program.account.task.fetch(taskPDA);

        expect(task).to.have.property('status').that.includes.keys('inProgress');

        try {
            await program.methods.finishTask(validCID)
                .accounts({user: user.publicKey, task: taskPDA})
                .signers([user])
                .rpc();
            throw new Error("Must not be successful")
        } catch (e) {
            expect(get(e, "error.errorCode.code", "")).to.equal("RequireKeysEqViolated");
        }

    });

    it('Should not finish task with non "In progress status"', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        await program.methods.finishTask(validCID)
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        const task = await program.account.task.fetch(taskPDA);

        expect(task).to.have.property('status').that.includes.keys('voting');

        try {
            await program.methods.finishTask(validCID)
                .accounts({user: user.publicKey, task: taskPDA})
                .signers([user])
                .rpc();
            throw new Error("Must not be successful")
        } catch (e) {
            expect(get(e, "error.errorCode.code", "")).to.equal("CanNotFinishTask");
        }
    });

    it('Should vote task and change status to success', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        await program.methods.finishTask(validCID)
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        for await (const i of [0, 1, 2, 3, 4]) {
            const user = new anchor.web3.Keypair();

            await program.methods.voteTask(new anchor.BN(1))
                .accounts({user: user.publicKey, task: taskPDA})
                .signers([user])
                .rpc();

            const task = await program.account.task.fetch(taskPDA);

            expect(task).to.have.property("approveVotes").with.lengthOf(i + 1);
            expect(task.approveVotes[i]).that.satisfy(k => k.toString() === user.publicKey.toString());

            if (i === 4) {
                expect(task).to.have.property('status').that.includes.keys('success');
            } else {
                expect(task).to.have.property('status').that.includes.keys('voting');
            }
        }
    }).timeout(5000);

    it('Should vote task and change status to fail', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();

        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        await program.methods.finishTask(validCID)
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        for await (const i of [0, 1, 2, 3, 4]) {
            const user = new anchor.web3.Keypair();

            await program.methods.voteTask(new anchor.BN(0))
                .accounts({user: user.publicKey, task: taskPDA})
                .signers([user])
                .rpc();

            const task = await program.account.task.fetch(taskPDA);

            expect(task).to.have.property("disapproveVotes").with.lengthOf(i + 1);
            expect(task.disapproveVotes[i]).that.satisfy(k => k.toString() === user.publicKey.toString());

            if (i === 4) {
                expect(task).to.have.property('status').that.includes.keys('fail');
            } else {
                expect(task).to.have.property('status').that.includes.keys('voting');
            }

        }
    }).timeout(5000);

    it('Should not vote one task twice', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        await program.methods.finishTask(validCID)
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        const voter = new anchor.web3.Keypair();

        await program.methods.voteTask(new anchor.BN(0))
            .accounts({user: voter.publicKey, task: taskPDA})
            .signers([voter])
            .rpc();

        const task = await program.account.task.fetch(taskPDA);

        expect(task).to.have.property("disapproveVotes").with.lengthOf(1);
        expect(task.disapproveVotes[0]).that.satisfy(k => k.toString() === voter.publicKey.toString());

        try {
            await program.methods.voteTask(new anchor.BN(0))
                .accounts({user: voter.publicKey, task: taskPDA})
                .signers([voter])
                .rpc();
            throw new Error("Must not be successful")
        } catch (e) {
            expect(get(e, "error.errorCode.code", "")).to.equal("CanNotVoteTaskSecondTime");
        }
    });

    it('Should not vote own task', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();


        await program.methods.takeTask()
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();

        await program.methods.finishTask(validCID)
            .accounts({user: user.publicKey, task: taskPDA})
            .signers([user])
            .rpc();


        try {
            await program.methods.voteTask(new anchor.BN(0))
                .accounts({user: user.publicKey, task: taskPDA})
                .signers([user])
                .rpc();
            throw new Error("Must not be successful")
        } catch (e) {
            expect(get(e, "error.errorCode.code", "")).to.equal("RequireKeysNeqViolated");
        }

    });

    it('Should not vote task with non "Voting" status', async () => {
        const taskPDA = await getNextTaskPDA();

        await program.methods.createTask("Will be taken", "description", 3600)
            .accounts({authority: provider.wallet.publicKey})
            .rpc();

        try {
            await program.methods.voteTask(new anchor.BN(0))
                .accounts({user: user.publicKey, task: taskPDA})
                .signers([user])
                .rpc();
            throw new Error("Must not be successful")
        } catch (e) {
            expect(get(e, "error.errorCode.code", "")).to.equal("CanNotVoteTask");
        }

    });
});

describe("promise_keeper_user_account", async () => {
    dotenv.config();

    const provider = anchor.AnchorProvider.local();
    const user = new anchor.web3.Keypair();
    const program = anchor.workspace.promise_keeper;

    anchor.setProvider(provider);

    before(async () => {
        const signature = await provider.connection.requestAirdrop(user.publicKey, 20_000_000);
        await provider.connection.confirmTransaction(signature);
    })

    it('Should create user account', async () => {
        const name = "Serhii Testovyy";

        const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
            [anchor.utils.bytes.utf8.encode("user"), user.publicKey.toBuffer()],
            program.programId
        );

        await program.methods.createUser(name, null, validCID)
            .accounts({authority: user.publicKey})
            .signers([user])
            .rpc();

        const userAccount1 = await program.account.user.fetch(pda);

        await program.methods.createUser(name, null, validCID)
            .accounts({authority: user.publicKey})
            .signers([user])
            .rpc();

        const userAccount2 = await program.account.user.fetch(pda);

        expect(userAccount1).to.have.property("nickname").equals(name);
        expect(userAccount1).to.be.deep.equal(userAccount2);
    });

    it('Should update user account', async () => {
        const name = "Serhii Testovyy";
        const newName = "Serhii Testovyy updated";

        const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
            [anchor.utils.bytes.utf8.encode("user"), user.publicKey.toBuffer()],
            program.programId
        );

        await program.methods.createUser(name, null, validCID)
            .accounts({authority: user.publicKey})
            .signers([user])
            .rpc();

        const userAccount1 = await program.account.user.fetch(pda);

        expect(userAccount1).to.have.property("nickname").equals(name);
        expect(userAccount1).to.have.property("avatarHash").equals(validCID);

        await program.methods.createUser(newName, null, null)
            .accounts({authority: user.publicKey})
            .signers([user])
            .rpc();

        const userAccount2 = await program.account.user.fetch(pda);

        expect(userAccount2).to.have.property("nickname").equals(newName);
        expect(userAccount2).to.have.property("avatarHash").equals(null);
    });

    it('Should not create user account with invalid data', async () => {
        const wrongSets: Array<[string, BN | null, string | null]> = [
            ["na", null, validCID],
            ["name", null, ""],
            ["name", null, validCID + "123"],
        ]

        for await (const set of wrongSets) {
            const [name, birthDate, avatarHash] = set;
            try {
                await program.methods.createUser(name, birthDate, avatarHash)
                    .accounts({authority: user.publicKey})
                    .signers([user])
                    .rpc();

                throw new Error(`Program should fail with values: ${set.join(",")}`);
            } catch (e) {
                expect(get(e, "error.errorCode.code", "")).to.equal("InvalidData");
            }
        }
    });

    it('Should get all accounts', async () => {
        const users = await program.account.user.all();

        console.log(users)
    });
})