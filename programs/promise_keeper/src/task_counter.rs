use anchor_lang::prelude::*;
use crate::defaults::TASK_COUNTER_IDENTIFIER;

#[account]
#[derive(InitSpace, Debug)]
pub struct TasksCounter {
    pub data: u64,
}

#[derive(Accounts)]
pub struct InitTaskCounter<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 8,
        seeds = [TASK_COUNTER_IDENTIFIER],
        bump
    )]
    pub(crate) counter: Account<'info, TasksCounter>,
    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}