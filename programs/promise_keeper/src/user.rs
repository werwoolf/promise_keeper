use crate::defaults::USER_IDENTIFIER;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateUser<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = User::SIZE,
        seeds = [USER_IDENTIFIER, &authority.key().as_ref()],
        bump
    )]
    pub(crate) user: Account<'info, User>,
    #[account(mut)]
    pub(crate) authority: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct User {
    pub(crate) authority: Pubkey,
    #[max_len(20)]
    pub(crate) nickname: String,
    pub(crate) birthdate: Option<u64>,
    #[max_len(46)]
    pub(crate) avatar_hash: Option<String>,
    pub(crate) registration_time: u64,
}

impl User {
    pub const SIZE: usize = 8 // discriminator
        + 32 // authority (pub key)
        + 24 // nickname (4 + length 20)
        + 9 //  birthdate (1 + 8)
        + 51 // avatar_hash (1 + 4 + length 46)
        + 8; // registration_time (8)
}
