use crate::promise_keeper::accounts::User;
use crate::promise_keeper::constants::{USER_MAX_AGE, USER_MIN_AGE};
use crate::utils::errors::assert_custom_error_code;
use crate::utils::user_profile::{create_user_profile, get_user_profile_account_pda};
use crate::utils::{
    context::{get_test_context, get_test_context_cached, TestContext},
    VALID_CID,
};
use chrono::{Utc, Datelike};
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
    
    let birthdate: Option<String> = None;
    let new_birthdate = Some(Utc::now()
        .with_year(Utc::now().year() - USER_MAX_AGE as i32 + 2)
        .expect("Error building birth date")
        .format("%Y-%m-%d")
        .to_string());
    
    let profile_pda = get_user_profile_account_pda(&user);

    create_user_profile(&user, &program, (None, birthdate.clone(), nickname.clone()))
        .await
        .expect("Failed create user request");

    let profile: User = program
        .account::<User>(profile_pda)
        .await
        .expect("Failed getting account");

    assert_eq!(profile.avatar_hash, None);
    assert_eq!(profile.birthdate, birthdate);
    assert_eq!(profile.nickname, nickname);
    
    create_user_profile(
        &user,
        &program,
        (
            Some(VALID_CID.to_string()),
            new_birthdate.clone(),
            new_nickname.clone(),
        ),
    )
    .await
    .expect("Failed create user request");

    let profile: User = program
        .account::<User>(profile_pda)
        .await
        .expect("Failed getting account");

    assert_eq!(profile.avatar_hash, Some(VALID_CID.to_string()));
    assert_eq!(profile.birthdate, new_birthdate);
    assert_eq!(profile.nickname, new_nickname);
}

#[tokio::test]
async fn should_not_create_user_account_with_invalid_data() {
    let context = get_test_context().await;
    let TestContext { user, program } = context;
    let current_year = Utc::now().year();

    let wrong_sets = [
        ((Some(VALID_CID.to_string()), None, "na".to_string()), 6008), // short nickname
        ((Some("".to_string()), None, "name".to_string()), 6011),      // empty CID
        (
            (
                Some(VALID_CID.to_string() + "123"),
                None,
                "name".to_string(),
            ),
            6011,
        ), // invalid CID
        (
            (Some("".to_string()), Some("2012/10-01".to_string()), "name".to_string()),
            6010,
        ), // invalid date format
        (
            (
                Some("".to_string()),
                Some(
                    Utc::now()
                        .with_year(current_year - USER_MAX_AGE as i32 - 1)
                        .expect("Error building birth date")
                        .format("%Y-%m-%d")
                        .to_string(),
                ),
                "name".to_string(),
            ),
            6009,
        ), // too old
        (
            (
                Some("".to_string()),
                Some(
                    Utc::now()
                        .with_year(current_year - USER_MIN_AGE as i32 + 1)
                        .expect("Error building birth date")
                        .format("%Y-%m-%d")
                        .to_string(),
                ),
                "name".to_string(),
            ),
            6009,
        ), // too young
    ];

    for (set, expected_code) in wrong_sets {
        let res = create_user_profile(&user, &program, set.clone()).await;

        assert_custom_error_code(res, expected_code)
    }
}
