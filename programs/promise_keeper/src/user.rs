use crate::defaults::{CID_V1_LENGTH, USER_IDENTIFIER, USER_NICKNAME_MAX_LENGTH};
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
    #[max_len(USER_NICKNAME_MAX_LENGTH)]
    pub nickname: String,
    pub birthdate: Option<u64>,
    #[max_len(CID_V1_LENGTH)]
    pub avatar_hash: Option<String>,
    pub registration_time: u64,
}

impl User {
    pub const SIZE: usize = 8 // discriminator
        + std::mem::size_of::<Pubkey>() // authority: pub key
        + 4 + USER_NICKNAME_MAX_LENGTH as usize // nickname: string + max length
        + 1 + 8 //  birthdate: option + u64
        + 1 + 4 +  CID_V1_LENGTH as usize// avatar_hash: option + string +
        + 8; // registration_time: u64
}
