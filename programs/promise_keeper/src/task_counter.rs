use anchor_lang::prelude::*;

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
        seeds = [b"task_counter"],
        bump
    )]
    pub(crate) counter: Account<'info, TasksCounter>,
    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}