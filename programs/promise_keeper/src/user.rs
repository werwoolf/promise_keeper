use crate::defaults::{
    CID_V1_LENGTH, USER_IDENTIFIER, USER_MAX_BIRTH_DATE, USER_MIN_BIRTH_DATE,
    USER_NICKNAME_MAX_LENGTH, USER_NICKNAME_MIN_LENGTH,
};
use crate::errors::ErrorCode;
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
        + 1 + 4 //  birthdate: option + u32
        + 1 + 4 + CID_V1_LENGTH as usize // avatar_hash: option + string +
        + 8; // registration_time: u64

    pub fn check_nickname(nickname: &String) -> Result<()> {
        match &nickname
            .len()
            .try_into()
            .map_err(|_| ErrorCode::NicknameLength)?
        {
            USER_NICKNAME_MIN_LENGTH..=USER_NICKNAME_MAX_LENGTH => Ok(()),
            _ => Err(ErrorCode::NicknameLength.into()),
        }
    }
    pub fn check_birthdate(birthdate: &Option<u64>) -> Result<()> {
        match birthdate {
            None => Ok(()),
            Some(date) if (USER_MIN_BIRTH_DATE..=USER_MAX_BIRTH_DATE).contains(&*date) => Ok(()),
            _ => Err(ErrorCode::BirthDate.into()),
        }
    }
}
