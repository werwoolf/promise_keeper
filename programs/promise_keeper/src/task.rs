use crate::defaults::{
    CID_V1_LENGTH, TASK_APPROVE_VOTES_TREASURE, TASK_COUNTER_IDENTIFIER,
    TASK_DESCRIPTION_MAX_LENGTH, TASK_DESCRIPTION_MIN_LENGTH, TASK_DISAPPROVE_VOTES_TREASURE,
    TASK_IDENTIFIER, TASK_MAX_TIME_TO_SOLVE_S, TASK_MIM_TIME_TO_SOLVE_S, TASK_NAME_MAX_LENGTH,
    TASK_NAME_MIN_LENGTH,
};
use crate::errors::ErrorCode;
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

    pub fn check_name(name: &String) -> Result<()> {
        match name
            .len()
            .try_into()
            .map_err(|_| ErrorCode::NameLength)?
        {
            TASK_NAME_MIN_LENGTH..=TASK_NAME_MAX_LENGTH => Ok(()),
            _ => Err(ErrorCode::NameLength.into()),
        }
    }
    pub fn check_description(description: &str) -> Result<()> {
        match description
            .len()
            .try_into()
            .map_err(|_| ErrorCode::DescriptionLength)?
        {
            TASK_DESCRIPTION_MIN_LENGTH..=TASK_DESCRIPTION_MAX_LENGTH => Ok(()),
            _ => Err(ErrorCode::DescriptionLength.into()),
        }
    }

    pub fn check_time_to_solve_s(time_to_solve_s: u32) -> Result<()> {
        match time_to_solve_s {
            TASK_MIM_TIME_TO_SOLVE_S..=TASK_MAX_TIME_TO_SOLVE_S => Ok(()),
            _ => Err(ErrorCode::TimeToSolve.into()),
        }
    }
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

impl Default for TaskStatus {
    fn default() -> Self {
        Self::Pending
    }
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
