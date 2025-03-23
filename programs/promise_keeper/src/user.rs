use crate::defaults::USER_IDENTIFIER;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = User::SIZE,
        seeds = [USER_IDENTIFIER, &authority.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct User {
    pub authority: Pubkey,
    #[max_len(20)]
    pub nickname: String,
    pub birthdate: Option<u64>,
    #[max_len(46)]
    pub avatar_hash: Option<String>,
    pub registration_time: u64,
}

impl User {
    pub const SIZE: usize = 8 // discriminator
        + 32 // authority (pub key)
        + 24 // nickname (4 + length 20)
        + 9 //  birthdate (1 + 8)
        + 51 // avatar_hash (1 + 4 + length 46)
        + 8; // registration_time (8)
}
