pub mod defaults;
pub mod errors;
pub mod task;
pub mod task_counter;
pub mod user;

use crate::user::{CreateUser, User};
use crate::defaults::{TASK_APPROVE_VOTES_TREASURE, TASK_DISAPPROVE_VOTES_TREASURE};
use anchor_lang::prelude::*;
use cid::Cid;
use errors::ErrorCode;
use task::*;
use task_counter::*;
use user::*;

declare_id!("6cJtEwsgr4jjw6MGqTZcQ2nsZ3YEhyZfrfuqwAfCeoG7");

#[program]
pub mod promise_keeper {
    use super::*;

    pub fn create_user(
        ctx: Context<CreateUser>,
        nickname: String,
        birthdate: Option<u64>,
        avatar_hash: Option<String>,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let timestamp = Clock::get()?.unix_timestamp as u64;

        User::check_nickname(&nickname)?;
        User::check_birthdate(&birthdate)?;

        match avatar_hash.clone() {
            Some(hash) => {
                Cid::try_from(hash).map_err(|_| ErrorCode::Avatar)?;
            }
            _ => {}
        };

        **user = User {
            nickname,
            birthdate,
            avatar_hash,
            authority: *ctx.accounts.authority.key,
            registration_time: match user.registration_time > 0 {
                true => user.registration_time,
                false => timestamp,
            },
        };

        Ok(())
    }

    pub fn create_task(
        ctx: Context<CreateTask>,
        name: String,
        description: String,
        time_to_solve_s: u32,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let counter = &mut ctx.accounts.counter;

        Task::check_name(&name)?;
        Task::check_description(&description)?;
        Task::check_time_to_solve_s(time_to_solve_s)?;

        task.name = name;
        task.description = description;
        task.time_to_solve_s = time_to_solve_s;

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
            return Err(ErrorCode::ImgProof.into());
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

        if task.approve_votes.len() >= TASK_APPROVE_VOTES_TREASURE.into() {
            task.status = TaskStatus::Success;
        } else if task.disapprove_votes.len() >= TASK_DISAPPROVE_VOTES_TREASURE.into() {
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
