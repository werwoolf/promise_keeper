use crate::promise_keeper::{
    self,
    client::{accounts, args},
    constants::USER_IDENTIFIER,
};
use anchor_client::solana_sdk::signature::{Keypair, Signature, Signer};
use anchor_client::solana_sdk::system_program;
use anchor_client::{ClientError, Program};
use anchor_lang::prelude::Pubkey;
use std::sync::Arc;

pub fn get_user_profile_account_pda(user: &Arc<Keypair>) -> Pubkey {
    Pubkey::find_program_address(
        &[USER_IDENTIFIER, user.pubkey().as_ref()],
        &Pubkey::from(promise_keeper::ID),
    )
    .0
}

pub async fn create_user_profile(
    user: &Arc<Keypair>,
    program: &Arc<Program<Arc<Keypair>>>,
    data: (Option<String>, Option<String>, String),
) -> Result<Signature, ClientError> {
    let (avatar_hash, birthdate, nickname) = data;
    program
        .request()
        .accounts(accounts::CreateUser {
            authority: user.pubkey(),
            user: get_user_profile_account_pda(user),
            system_program: system_program::ID,
        })
        .args(args::CreateUser {
            avatar_hash,
            birthdate,
            nickname,
        })
        .signer(user.clone())
        .send()
        .await
}
