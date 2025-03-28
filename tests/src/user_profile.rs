use crate::utils::{
    context::{get_test_context, get_test_context_cached, TestContext},
    VALID_CID,
};
use anchor_client::solana_sdk::{signer::Signer, system_program};
use anchor_client::{anchor_lang::declare_program, ClientError};
use anchor_lang::prelude::Pubkey;
use std::ops::Deref;

declare_program!(promise_keeper);
use promise_keeper::{accounts::User, client::accounts, client::args};

#[tokio::test]
async fn should_create_user_account() {
    let context = get_test_context_cached().await;
    let TestContext { user, program } = context.deref();

    let nickname = "Serhii Testovyy".to_string();

    let (profile_pda, _) = Pubkey::find_program_address(
        &[b"user", user.pubkey().as_ref()],
        &Pubkey::from(promise_keeper::ID),
    );

    program
        .request()
        .accounts(accounts::CreateUser {
            authority: user.pubkey(),
            user: profile_pda,
            system_program: system_program::ID,
        })
        .args(args::CreateUser {
            avatar_hash: Some(VALID_CID.to_string()),
            birthdate: None,
            nickname: nickname.clone(),
        })
        .signer(user.clone())
        .send()
        .await
        .expect("Failed sending create user profile request");

    let profile: User = program
        .account::<User>(profile_pda)
        .await
        .expect("Failed getting account");

    assert_eq!(profile.avatar_hash, Some(VALID_CID.to_string()));
    assert_eq!(profile.birthdate, None);
    assert_eq!(profile.nickname, nickname);
}

#[tokio::test]
async fn should_update_user_account() {
    let nickname = "Serhii Testovyy".to_string();
    let new_nickname = "Serhii Testovyy updated".to_string();

    let context = get_test_context().await;
    let TestContext { user, program } = context;

    let (profile_pda, _) = Pubkey::find_program_address(
        &[b"user", user.pubkey().as_ref()],
        &Pubkey::from(promise_keeper::ID),
    );

    program
        .request()
        .accounts(accounts::CreateUser {
            authority: user.pubkey(),
            user: profile_pda,
            system_program: system_program::ID,
        })
        .args(args::CreateUser {
            avatar_hash: None,
            birthdate: None,
            nickname: nickname.clone(),
        })
        .signer(user.clone())
        .send()
        .await
        .expect("Failed sending create user profile request");

    let profile: User = program
        .account::<User>(profile_pda)
        .await
        .expect("Failed getting account");

    assert_eq!(profile.avatar_hash, None);
    assert_eq!(profile.birthdate, None);
    assert_eq!(profile.nickname, nickname);

    program
        .request()
        .accounts(accounts::CreateUser {
            authority: user.pubkey(),
            user: profile_pda,
            system_program: system_program::ID,
        })
        .args(args::CreateUser {
            avatar_hash: Some(VALID_CID.to_string()),
            birthdate: None,
            nickname: new_nickname.clone(),
        })
        .signer(user.clone())
        .send()
        .await
        .expect("Failed sending create user profile request");

    let profile: User = program
        .account::<User>(profile_pda)
        .await
        .expect("Failed getting account");

    assert_eq!(profile.avatar_hash, Some(VALID_CID.to_string()));
    assert_eq!(profile.birthdate, None);
    assert_eq!(profile.nickname, new_nickname);
}

#[tokio::test]
pub async fn should_not_create_user_account_with_invalid_data() {
    let context = get_test_context().await;
    let TestContext { user, program } = context;

    let wrong_sets = [
        ("na".to_string(), None, Some(VALID_CID.to_string())),
        ("name".to_string(), None, Some("".to_string())),
        (
            "name".to_string(),
            None,
            Some(VALID_CID.to_string() + "123"),
        ),
    ];

    let (profile_pda, _) = Pubkey::find_program_address(
        &[b"user", user.pubkey().as_ref()],
        &Pubkey::from(promise_keeper::ID),
    );

    for wrong_set in wrong_sets {
        let (nickname, birthdate, avatar_hash) = wrong_set;

        let res = program
            .request()
            .accounts(accounts::CreateUser {
                authority: user.pubkey(),
                user: profile_pda,
                system_program: system_program::ID,
            })
            .args(args::CreateUser {
                avatar_hash,
                birthdate,
                nickname,
            })
            .signer(user.clone())
            .send()
            .await;

        assert!(res.is_err_and(|e| {
            match e {
                ClientError::SolanaClientError(e) => true,
                _ => false,
            }
        }));
    }
}
