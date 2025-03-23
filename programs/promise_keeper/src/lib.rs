pub mod task;
pub mod task_counter;

use anchor_lang::prelude::*;
use task::*;
use task_counter::*;

declare_id!("3BsTL53Aab3un682i8sjPeyQSgPMhXmwM3aDv7Py3gR9");

//todo: authorization
// account
// type state ??
// use constants
// auto init counter
// proper status string type
// sign creation

#[program]
pub mod promise_keeper {
    use super::*;
    use anchor_lang::error::Error::ProgramError;
    use cid::Cid;

    const VOTES_MAJORITY_LIMIT: u8 = 5;

    pub fn create_task(
        ctx: Context<CreateTask>,
        name: String,
        description: String,
        time_to_solve_s: u32,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let counter = &mut ctx.accounts.counter;

        // todo: move to acc impl
        if (name.len() < 3) || (description.len() < 3) || (time_to_solve_s < 3600) {
            return Err(ErrorCode::InvalidData.into());
        }

        // todo: move to impl
        **task = Task {
            name,
            description,
            due_date_s: None,
            time_to_solve_s,
            user_id: None,
            img_proof_hash: None,
            status: TaskStatus::Pending,
            approve_votes: vec![],
            disapprove_votes: vec![],
        };

        counter.data += 1;

        Ok(())
    }

    pub fn take_task(ctx: Context<TakeTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        if task.user_id.is_some() {
            return Err(ErrorCode::TaskAlreadyTaken.into());
        }

        task.user_id = Some(ctx.accounts.user.key());
        task.status = TaskStatus::InProgress;
        task.due_date_s = Some(Clock::get()?.unix_timestamp as u64 + task.time_to_solve_s as u64);

        Ok(())
    }

    pub fn finish_task(ctx: Context<FinishTask>, img_proof_hash: String) -> Result<()> {
        if Cid::try_from(img_proof_hash.clone()).is_err() {
            return Err(ErrorCode::InvalidData.into());
        }

        let user = &mut ctx.accounts.user;
        let task = &mut ctx.accounts.task;
        let due_date_s = task
            .due_date_s
            .ok_or::<ErrorCode>(ErrorCode::InternalError)?;

        if due_date_s < Clock::get()?.unix_timestamp as u64 {
            return Err(ErrorCode::TaskStale.into());
        }

        if task.status != TaskStatus::InProgress {
            return Err(ErrorCode::CanNotFinishTask.into());
        }

        require_keys_eq!(
            user.key.key(),
            task.user_id
                .ok_or::<ErrorCode>(ErrorCode::CanNotFinishTask.into())?
                .key()
        );

        task.status = TaskStatus::Voting;
        task.img_proof_hash = Some(img_proof_hash);

        Ok(())
    }

    pub fn vote_task(ctx: Context<VoteTask>, approve: u8) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let user = &mut ctx.accounts.user;
        let is_approved = approve != 0;

        if task.status != TaskStatus::Voting {
            return Err(ErrorCode::CanNotVoteTask.into());
        }

        require_keys_neq!(
            user.key(),
            task.user_id
                .ok_or::<ErrorCode>(ErrorCode::CanNotFinishTask.into())?
                .key()
        );

        let user_has_already_voted_task =
            task.approve_votes.contains(&user.key()) || task.disapprove_votes.contains(&user.key());

        if user_has_already_voted_task {
            return Err(ErrorCode::CanNotVoteTaskSecondTime.into());
        }

        if is_approved {
            task.approve_votes.push(ctx.accounts.user.key());
        } else {
            task.disapprove_votes.push(ctx.accounts.user.key());
        }

        // todo: impl task account
        if task.approve_votes.len() >= VOTES_MAJORITY_LIMIT.into() {
            task.status = TaskStatus::Success;
        } else if task.disapprove_votes.len() >= 5 {
            task.status = TaskStatus::Fail;
        }

        Ok(())
    }

    pub fn init_task_counter(ctx: Context<InitTaskCounter>) -> Result<()> {
        let tasks_counter = &mut ctx.accounts.counter;

        **tasks_counter = TasksCounter { data: 0 };

        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Check input data")]
    InvalidData,

    #[msg("You are not authorized to perform this action.")]
    Unauthorized,

    #[msg("Only task with status \"In progress\" can be finished.")]
    CanNotFinishTask,

    #[msg("Only task with status \"Voting\" can be voted.")]
    CanNotVoteTask,

    #[msg("You have already voted this task")]
    CanNotVoteTaskSecondTime,

    #[msg("You have already voted this task.")]
    TaskAlreadyVoted,

    #[msg("Task already taken.")]
    TaskAlreadyTaken,

    #[msg("The task time has expired.")]
    TaskStale,

    #[msg("TInternal program error.")]
    InternalError,
}
