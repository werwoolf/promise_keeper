use crate::tasks::promise_keeper::accounts::TasksCounter;
use crate::tasks::promise_keeper::client::{accounts, args};
use crate::utils::context::{get_test_context, TestContext};
use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::solana_sdk::signature::{Keypair, Signature, Signer};
use anchor_client::solana_sdk::system_program;
use anchor_client::{ClientError, Program};
use anchor_lang::declare_program;
use std::sync::Arc;

declare_program!(promise_keeper);

pub fn get_tasks_counter_pda() -> Pubkey {
    Pubkey::find_program_address(&[b"task_counter"], &Pubkey::from(promise_keeper::ID)).0
}

pub async fn get_next_task_pda() -> Pubkey {
    let context = get_test_context().await;
    let TestContext { program, .. } = context;

    let tasks_counter_pda = get_tasks_counter_pda();
    let task_counter = program
        .account::<TasksCounter>(tasks_counter_pda)
        .await
        .expect("Failed getting account");

    Pubkey::find_program_address(
        &[b"task", &task_counter.data.to_le_bytes()],
        &Pubkey::from(promise_keeper::ID),
    )
    .0
}

pub async fn create_task(
    user: &Arc<Keypair>,
    program: &Arc<Program<Arc<Keypair>>>,
    data: (String, String, u32),
) -> Result<Signature, ClientError> {
    let next_task_pda = get_next_task_pda().await;
    let (name, description, time_to_solve_s) = data;

    program
        .request()
        .accounts(accounts::CreateTask {
            authority: user.pubkey(),
            task: next_task_pda,
            counter: get_tasks_counter_pda(),
            system_program: system_program::ID,
        })
        .args(args::CreateTask {
            name,
            description,
            time_to_solve_s,
        })
        .signer(user.clone())
        .send()
        .await
}

pub async fn take_task(
    user: &Arc<Keypair>,
    program: &Arc<Program<Arc<Keypair>>>,
    task: Pubkey,
) -> Result<Signature, ClientError> {
    program
        .request()
        .accounts(accounts::TakeTask {
            user: user.pubkey(),
            task,
        })
        .args(args::TakeTask)
        .signer(user.clone())
        .send()
        .await
}

pub async fn finish_task(
    user: &Arc<Keypair>,
    program: &Arc<Program<Arc<Keypair>>>,
    task: Pubkey,
    img_proof_hash: String,
) -> Result<Signature, ClientError> {
    program
        .request()
        .accounts(accounts::FinishTask {
            user: user.pubkey(),
            task,
        })
        .args(args::FinishTask { img_proof_hash })
        .signer(user.clone())
        .send()
        .await
}

pub async fn vote_task(
    user: &Arc<Keypair>,
    program: &Arc<Program<Arc<Keypair>>>,
    task: Pubkey,
    approve: u8,
) -> Result<Signature, ClientError> {
    program
        .request()
        .accounts(accounts::VoteTask {
            user: user.pubkey(),
            task,
        })
        .args(args::VoteTask { approve })
        .signer(user.clone())
        .send()
        .await
}
