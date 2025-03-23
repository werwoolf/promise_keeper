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
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct User {
    #[max_len(20)]
    pub(crate) nickname: String,
    pub(crate) birthdate: Option<u64>,
    #[max_len(46)]
    pub(crate) avatar_hash: Option<String>,
    pub(crate) registration_time: u64,
}

impl User {
    pub const SIZE: usize = 8 + // discriminator
        4 + 20 + // nickname: length prefix (4) + max length (20)
        1 + 8 + // birthdate: Option<u64> (1 byte for tag + 8 bytes for u64)
        1 + 46 + // avatar_hash: ength prefix (4) + max length (46)
        8; // registration_time u64
}
