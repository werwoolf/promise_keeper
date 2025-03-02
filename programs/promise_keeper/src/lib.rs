use anchor_lang::prelude::*;
use std::mem::size_of;
use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};

declare_id!("ARKDUPvSk7fVmY676dLctbqDfncxy6SPiTVhy8zJabCC");

#[program]
pub mod promise_keeper {
    use super::*;

    pub fn create_task(
        ctx: Context<CreateTask>,
        name: String,
        description: String,
        time_to_solve_s: u32,
    ) -> Result<()> {
        let mut task = &mut ctx.accounts.task;
        let bump = ctx.bumps.task;

        **task = Task {
            name,
            description,
            due_date: None,
            time_to_solve_s: 259_200,
            user_id: None,
            img_proof_hash: None,
            status: TaskStatus::Pending,
        };

        Ok(())
    }

    pub fn take_task(ctx: Context<TakeTask>) -> Result<()> {
        let task = &mut ctx.accounts.task; // Account for the task
        if let Some(user_id) = task.user_id {
            return Err(ErrorCode::TaskAlreadyTaken.into());
        }

        task.user_id = Some(ctx.accounts.user.key());

        task.status = TaskStatus::InProgress;

        msg!("Task taken successfully by user: {:?}", ctx.accounts.user.key());

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
#[instruction(description: String)]
#[instruction(time_to_solve_s: u32)]
pub struct CreateTask<'info> {
    #[account(
        init,
        payer = authority,
        space = Task::SIZE,
        seeds = [b"task", name.as_bytes()],
        bump
    )]
    task: Account<'info, Task>,
    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Task {
    #[max_len(10)]
    name: String,
    #[max_len(100)]
    description: String,
    #[max_len(10)]
    due_date: Option<u64>,
    #[max_len(10)]
    time_to_solve_s: u32,
    #[max_len(10)]
    user_id: Option<Pubkey>,
    #[max_len(10)]
    img_proof_hash: Option<String>,
    status: TaskStatus,
}

#[derive(
    AnchorSerialize, AnchorDeserialize,
    InitSpace,
    Clone, Debug,
    serde::Serialize, serde::Deserialize,
)]
#[serde(rename_all = "PascalCase")]
pub enum TaskStatus {
    Pending,
    InProgress,
    Voting,
    Stale,
    Success,
    Fail,
}

impl Task {
    pub const SIZE: usize = 8 + // discriminator
        4 + 10 + // name: length prefix (4) + max length (10)
        4 + 100 + // description: length prefix (4) + max length (100)
        1 + 8 + // due_date: 1 byte for Option + 8 bytes for u64
        4 + // time_to_solve_s: u32
        1 + 4 + 10 + // user_id: 1 byte for Option + length prefix (4) + max length (10)
        1 + 4 + 10 + // img_proof_hash: same as above
        1; // status: 1 byte (enum is stored as a single byte)
}

#[derive(Accounts, Debug)]
pub struct TakeTask<'info> {
    #[account(mut)]
    user: Signer<'info>,
    #[account(mut)]
    task: Account<'info, Task>,
}


#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Task already taken")]
    TaskAlreadyTaken
}

