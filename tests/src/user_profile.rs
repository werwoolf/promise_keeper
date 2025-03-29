use crate::promise_keeper::accounts::User;
use crate::utils::user_profile::{create_user_profile, get_user_profile_account_pda};
use crate::utils::{
    context::{get_test_context, get_test_context_cached, TestContext},
    VALID_CID,
};
use anchor_client::ClientError;
use std::ops::Deref;

#[tokio::test]
async fn should_create_user_account() {
    let context = get_test_context_cached().await;
    let TestContext { user, program } = context.deref();

    let nickname = "Serhii Testovyy".to_string();

    let profile_pda = get_user_profile_account_pda(user);

    create_user_profile(
        user,
        program,
        (Some(VALID_CID.to_string()), None, nickname.clone()),
    )
    .await
    .expect("Failed create user request");

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
    let context = get_test_context().await;
    let TestContext { user, program } = context;

    let nickname = "Serhii Testovyy".to_string();
    let new_nickname = "Serhii Testovyy updated".to_string();

    let profile_pda = get_user_profile_account_pda(&user);

    create_user_profile(&user, &program, (None, None, nickname.clone()))
        .await
        .expect("Failed create user request");

    let profile: User = program
        .account::<User>(profile_pda)
        .await
        .expect("Failed getting account");

    assert_eq!(profile.avatar_hash, None);
    assert_eq!(profile.birthdate, None);
    assert_eq!(profile.nickname, nickname);

    create_user_profile(
        &user,
        &program,
        (Some(VALID_CID.to_string()), None, new_nickname.clone()),
    )
    .await
    .expect("Failed create user request");

    let profile: User = program
        .account::<User>(profile_pda)
        .await
        .expect("Failed getting account");

    assert_eq!(profile.avatar_hash, Some(VALID_CID.to_string()));
    assert_eq!(profile.birthdate, None);
    assert_eq!(profile.nickname, new_nickname);
}

#[tokio::test]
async fn should_not_create_user_account_with_invalid_data() {
    let context = get_test_context().await;
    let TestContext { user, program } = context;

    let wrong_sets = [
        (Some(VALID_CID.to_string()), None, "na".to_string()),
        (Some("".to_string()), None, "name".to_string()),
        (
            Some(VALID_CID.to_string() + "123"),
            None,
            "name".to_string(),
        ),
    ];

    for set in wrong_sets {
        let res = create_user_profile(&user, &program, set).await;

        assert!(res.is_err_and(|e| {
            match e {
                ClientError::SolanaClientError(e) => true,
                _ => false,
            }
        }));
    }
}
