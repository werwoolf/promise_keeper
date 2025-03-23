use crate::defaults::{TASK_COUNTER_IDENTIFIER, TASK_IDENTIFIER};
use crate::task_counter::TasksCounter;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateTask<'info> {
    #[account(
        init,
        payer = authority,
        space = Task::SIZE,
        seeds = [TASK_IDENTIFIER, &counter.data.to_le_bytes()],
        bump
    )]
    pub(crate) task: Account<'info, Task>,
    #[account(mut)]
    authority: Signer<'info>,
    #[account(mut, seeds = [TASK_COUNTER_IDENTIFIER], bump)]
    pub(crate) counter: Account<'info, TasksCounter>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Task {
    #[max_len(10)]
    pub(crate) name: String,
    #[max_len(100)]
    pub(crate) description: String,
    #[max_len(10)]
    pub(crate) due_date_s: Option<u64>,
    #[max_len(10)]
    pub(crate) time_to_solve_s: u32,
    #[max_len(10)]
    pub(crate) user_id: Option<Pubkey>,
    #[max_len(10)]
    pub(crate) img_proof_hash: Option<String>,
    pub(crate) status: TaskStatus,
    #[max_len(9)]
    pub(crate) approve_votes: Vec<Pubkey>,
    #[max_len(9)]
    pub(crate) disapprove_votes: Vec<Pubkey>,
}

impl Task {
    pub const SIZE: usize = 8 + // discriminator
        4 + 10 + // name: length prefix (4) + max length (10)
        4 + 100 + // description: length prefix (4) + max length (100)
        1 + 8 + // due_date: Option<u64> (1 byte for tag + 8 bytes for u64)
        4 + // time_to_solve_s: u32
        1 + 32 + // user_id: Option<Pubkey> (1 byte for tag + 32 bytes for Pubkey)
        1 + 4 + 10 + // img_proof_hash: Option<String> (1 byte for tag + 4 bytes for length + 10 bytes for data)
        1 + // status: TaskStatus
        4 + (32 * 9) + // approve_votes: Vec<Pubkey> (4 bytes for length + 9 * 32 bytes for Pubkeys)
        4 + (32 * 9); // disapprove_votes: Vec<Pubkey> (same as above)
}

#[derive(InitSpace, Clone, Debug, AnchorDeserialize, AnchorSerialize, PartialEq)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Voting,
    Stale,
    Success,
    Fail,
}

#[derive(Accounts, Debug)]
pub struct TakeTask<'info> {
    #[account(mut)]
    pub(crate) user: Signer<'info>,
    #[account(mut)]
    pub(crate) task: Account<'info, Task>,
}

#[derive(Accounts, Debug)]
#[instruction(img_proof_hash: String)]
pub struct FinishTask<'info> {
    #[account(mut)]
    pub(crate) user: Signer<'info>,
    #[account(mut)]
    pub(crate) task: Account<'info, Task>,
}

#[derive(Accounts, Debug)]
pub struct VoteTask<'info> {
    #[account(mut)]
    pub(crate) user: Signer<'info>,
    #[account(mut)]
    pub(crate) task: Account<'info, Task>,
}
