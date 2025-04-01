use crate::defaults::{
    CID_V1_LENGTH, USER_IDENTIFIER, USER_MAX_AGE, USER_MIN_AGE, USER_NICKNAME_MAX_LENGTH,
    USER_NICKNAME_MIN_LENGTH,
};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use chrono::{DateTime, Datelike, NaiveDate, NaiveDateTime, Utc};
use std::str::FromStr;

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
    #[max_len(10)] // ISO date like 2025-03-31
    pub birthdate: Option<String>,
    #[max_len(CID_V1_LENGTH)]
    pub avatar_hash: Option<String>,
    pub registration_time: u64,
}

impl User {
    pub const SIZE: usize = 8 // discriminator
        + std::mem::size_of::<Pubkey>() // authority: pub key
        + 4 + USER_NICKNAME_MAX_LENGTH as usize // nickname: string + max length
        + 1 + 4 + 10 //  birthdate: option + string + length
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
    pub fn check_birthdate(birthdate: &Option<String>) -> Result<()> {
        msg!("Birth date 1: {:?}", birthdate);
        let birthdate = match birthdate {
            None => return Ok(()),
            Some(date) => {
                NaiveDate::parse_from_str(date, "%Y-%m-%d").map_err(|_| ErrorCode::BirthFormat)?
            }
        };
        msg!("Birth date: {:?}", birthdate);
        let current_date = DateTime::from_timestamp(Clock::get()?.unix_timestamp as i64, 0)
            .ok_or(ErrorCode::InternalError)?
            .date_naive();
        msg!("Birth date: {:?}", birthdate);
        msg!("current_date date: {:?}", current_date);

        match NaiveDate::years_since(&current_date, birthdate) {
            Some(age) if (USER_MIN_AGE as u32..=USER_MAX_AGE as u32).contains(&age) => Ok(()),
            _ => Err(ErrorCode::BirthDate.into()),
        }
    }
}
