use crate::defaults::TASK_COUNTER_IDENTIFIER;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitTaskCounter<'info> {
    #[account(
        init,
        payer = authority,
        space = TasksCounter::SIZE,
        seeds = [TASK_COUNTER_IDENTIFIER],
        bump
    )]
    pub(crate) counter: Account<'info, TasksCounter>,
    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct TasksCounter {
    pub data: u64,
}

impl TasksCounter {
    pub const SIZE: usize = 8 // discriminator
        + 8; // data: u64
}
