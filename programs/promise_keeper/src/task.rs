use crate::defaults::{
    CID_V1_LENGTH, TASK_APPROVE_VOTES_TREASURE, TASK_COUNTER_IDENTIFIER,
    TASK_DESCRIPTION_MAX_LENGTH, TASK_DISAPPROVE_VOTES_TREASURE, TASK_IDENTIFIER,
    TASK_NAME_MAX_LENGTH,
};
use crate::task_counter::TasksCounter;
use anchor_lang::prelude::*;

#[derive(Accounts)]
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
    #[max_len(TASK_NAME_MAX_LENGTH)]
    pub(crate) name: String,
    #[max_len(TASK_DESCRIPTION_MAX_LENGTH)]
    pub(crate) description: String,
    pub(crate) due_date_s: Option<u64>,
    pub(crate) time_to_solve_s: u32,
    pub(crate) user_id: Option<Pubkey>,
    #[max_len(CID_V1_LENGTH)]
    pub(crate) img_proof_hash: Option<String>,
    pub(crate) status: TaskStatus,
    #[max_len(TASK_APPROVE_VOTES_TREASURE)]
    pub(crate) approve_votes: Vec<Pubkey>,
    #[max_len(TASK_DISAPPROVE_VOTES_TREASURE)]
    pub(crate) disapprove_votes: Vec<Pubkey>,
}

impl Task {
    pub const SIZE: usize = 8 + // discriminator
        4 * (TASK_NAME_MAX_LENGTH as usize) + // name: prefix + max length
        4 + (TASK_DESCRIPTION_MAX_LENGTH as usize) + // description: prefix + max length
        1 + 8 + // due_date: option + u64
        4 + // time_to_solve_s: u32
        1 + std::mem::size_of::<Pubkey>() + // user_id: option + pub key 
        1 + 4 + (CID_V1_LENGTH as usize) + // img_proof_hash: option + string + max length
        1 + // status: enum
        4 + (std::mem::size_of::<Pubkey>() * TASK_APPROVE_VOTES_TREASURE as usize) + // approve_votes: vector + pub key * max length
        4 + (std::mem::size_of::<Pubkey>() * TASK_DISAPPROVE_VOTES_TREASURE as usize); // disapprove_votes: vector + pub key * max length
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
