use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateUser<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = std::mem::size_of::<User>() + 8,
        seeds = [b"user".as_ref(), &authority.key().as_ref()],
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
    #[max_len(10)]
    pub(crate) nickname: String,
    pub(crate) birthdate: Option<u64>,
    #[max_len(10)]
    pub(crate) avatar_hash: Option<String>,
    pub(crate) registration_time: u64,
}
