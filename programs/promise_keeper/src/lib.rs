use anchor_lang::prelude::*;
use std::mem::size_of;

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
            approve_votes: vec![],
            disapprove_votes: vec![],
        };

        Ok(())
    }

    pub fn take_task(ctx: Context<TakeTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        if let Some(user_id) = task.user_id {
            return Err(ErrorCode::TaskAlreadyTaken.into());
        }

        task.user_id = Some(ctx.accounts.user.key());

        task.status = TaskStatus::InProgress;

        msg!("Task taken successfully by user: {:?}", ctx.accounts.user.key());

        Ok(())
    }

    pub fn finish_task(ctx: Context<FinishTask>, img_proof_hash: String) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.status = TaskStatus::Voting;
        task.img_proof_hash = Some(img_proof_hash);

        Ok(())
    }

    pub fn vote_task(ctx: Context<VoteTask>, approve: u8) -> Result<()> {
        println!("---> {approve}");
        let task = &mut ctx.accounts.task;

        if approve != 0 {
            task.approve_votes.push(ctx.accounts.user.key());
        } else {
            task.approve_votes.push(ctx.accounts.user.key());
        }

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
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
    #[max_len(9)]
    approve_votes: Vec<Pubkey>,
    #[max_len(9)]
    disapprove_votes: Vec<Pubkey>,
}

#[derive(InitSpace, Clone, Debug, AnchorDeserialize, AnchorSerialize)]
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
        1 + 8 + // due_date: Option<u64> (1 byte for tag + 8 bytes for u64)
        4 + // time_to_solve_s: u32
        1 + 32 + // user_id: Option<Pubkey> (1 byte for tag + 32 bytes for Pubkey)
        1 + 4 + 10 + // img_proof_hash: Option<String> (1 byte for tag + 4 bytes for length + 10 bytes for data)
        1 + // status: TaskStatus
        4 + (32 * 9) + // approve_votes: Vec<Pubkey> (4 bytes for length + 9 * 32 bytes for Pubkeys)
        4 + (32 * 9); // disapprove_votes: Vec<Pubkey> (same as above)
}

#[derive(Accounts, Debug)]
pub struct TakeTask<'info> {
    #[account(mut)]
    user: Signer<'info>,
    #[account(mut)]
    task: Account<'info, Task>,
}

#[derive(Accounts, Debug)]
#[instruction(img_proof_hash: String)]
pub struct FinishTask<'info> {
    #[account(mut)]
    user: Signer<'info>,
    #[account(mut)]
    task: Account<'info, Task>,
}

#[derive(Accounts, Debug)]
pub struct VoteTask<'info> {
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
    TaskAlreadyTaken,
}

