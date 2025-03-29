declare_program!(promise_keeper);

use crate::tasks::promise_keeper::types::TaskStatus;
use crate::utils::context::{get_test_context_cached, TestContext};
use crate::utils::tasks::{
    create_task, finish_task, get_next_task_pda, get_tasks_counter_pda, take_task, vote_task,
};
use crate::utils::VALID_CID;
use anchor_client::solana_sdk::signature::Keypair;
use anchor_client::solana_sdk::signer::Signer;
use anchor_client::ClientError;
use anchor_lang::declare_program;
use std::ops::Deref;
use std::sync::Arc;
use uuid::Uuid;

use promise_keeper::accounts::{Task, TasksCounter};

impl PartialEq for TaskStatus {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (TaskStatus::Pending, TaskStatus::Pending) => true,
            (TaskStatus::InProgress, TaskStatus::InProgress) => true,
            (TaskStatus::Voting, TaskStatus::Voting) => true,
            (TaskStatus::Stale, TaskStatus::Stale) => true,
            (TaskStatus::Success, TaskStatus::Success) => true,
            (TaskStatus::Fail, TaskStatus::Fail) => true,
            _ => false,
        }
    }
}

#[tokio::test]
async fn should_find_task_counter_account() {
    let context = get_test_context_cached().await;
    let TestContext { program, .. } = context.deref();

    let pda = get_tasks_counter_pda();

    program
        .account::<TasksCounter>(pda)
        .await
        .expect("Failed getting account");
}

#[tokio::test]
async fn should_update_task_counter_account() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let pda = get_tasks_counter_pda();

    let init_counter = program
        .account::<TasksCounter>(pda)
        .await
        .expect("Failed getting account");

    let name = "Sample Task".to_string();
    let description = "This is a test task".to_string();
    let time_to_solve_s = 3600;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    let updated_counter = program
        .account::<TasksCounter>(pda)
        .await
        .expect("Failed getting account");

    assert_eq!(updated_counter.data - init_counter.data, 1)
}

#[tokio::test]
async fn should_not_create_task_with_invalid_data() {
    let context = get_test_context_cached().await;
    let TestContext { user, program } = context.deref();

    let wrong_sets = [
        ("na".to_string(), "description".to_string(), 3600), // short name
        ("name".to_string(), "de".to_string(), 3600),        // short description
        ("name".to_string(), "description".to_string(), 3599), // short time to solve,
    ];

    for wrong_set in wrong_sets {
        let res = create_task(user, program, wrong_set).await;

        assert!(res.is_err_and(|e| {
            match e {
                ClientError::SolanaClientError(e) => true,
                _ => false,
            }
        }));
    }
}

#[tokio::test]
async fn should_create_task_with_valid_data() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let data_sets = [
        (
            "Some long task name".to_string(),
            "description".to_string(),
            36000,
        ),
        (
            "QWE".to_string(),
            "Some very long description for task".to_string(),
            9999,
        ),
        ("Name".to_string(), "description".to_string(), 3600),
    ];

    for set in data_sets {
        let (name, description, time_to_solve_s) = set.clone();
        let next_task_pda = get_next_task_pda().await;

        create_task(user, program, set).await.expect("");

        let task = program
            .account::<Task>(next_task_pda)
            .await
            .expect("Failed getting task");

        assert_eq!(task.name, name);
        assert_eq!(task.description, description);
        assert_eq!(task.due_date_s, None);
        assert_eq!(task.time_to_solve_s, time_to_solve_s);
        assert_eq!(task.user_id, None);
        assert_eq!(task.img_proof_hash, None);
        assert_eq!(task.status, TaskStatus::Pending);
        assert_eq!(task.approve_votes.len(), 0);
        assert_eq!(task.disapprove_votes.len(), 0);
    }
}

#[tokio::test]
async fn should_get_all_tasks() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(
        user,
        program,
        (name.clone(), description.clone(), time_to_solve_s),
    )
    .await
    .expect("Failed sending create task request");

    program
        .accounts::<Task>(vec![])
        .await
        .expect("Failed getting task")
        .iter()
        .find(|(_, task)| {
            task.name == name
                && task.description == description
                && task.time_to_solve_s == time_to_solve_s
        })
        .expect("Created task has not been found");
}

#[tokio::test]
async fn should_take_task() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    let task = program
        .account::<Task>(next_task_pda)
        .await
        .expect("Failed getting task");

    assert_eq!(task.status, TaskStatus::Pending);

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    let task = program
        .account::<Task>(next_task_pda)
        .await
        .expect("Failed getting task");

    assert_eq!(task.status, TaskStatus::InProgress);
    assert_eq!(task.user_id, Some(user.pubkey()));
}

#[tokio::test]
async fn should_not_take_already_taken_task() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    let task = program
        .account::<Task>(next_task_pda)
        .await
        .expect("Failed getting task");

    assert_eq!(task.status, TaskStatus::Pending);

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    let task = program
        .account::<Task>(next_task_pda)
        .await
        .expect("Failed getting task");

    assert_eq!(task.status, TaskStatus::InProgress);

    let res = take_task(user, program, next_task_pda).await;

    assert!(res.is_err_and(|e| {
        match e {
            ClientError::SolanaClientError(e) => true,
            _ => false,
        }
    }));
}

#[tokio::test]
async fn should_finish_task() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    finish_task(user, program, next_task_pda, VALID_CID.to_string())
        .await
        .expect("Failed sending finish task request");

    let task = program
        .account::<Task>(next_task_pda)
        .await
        .expect("Failed getting task");

    assert_eq!(task.status, TaskStatus::Voting);
    assert_eq!(task.img_proof_hash, Some(VALID_CID.to_string()));
}

#[tokio::test]
async fn should_not_finish_task_with_invalid_image_proof_hash() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    let res = finish_task(user, program, next_task_pda, VALID_CID.to_string() + "123").await;

    assert!(res.is_err_and(|e| {
        match e {
            ClientError::SolanaClientError(e) => true,
            _ => false,
        }
    }));
}

#[tokio::test]
async fn should_not_finish_someones_else_task() {
    let context = get_test_context_cached().await;
    let TestContext {
        program,
        user: doer,
    } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(doer, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(doer, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    let another_user = Keypair::new();

    let res = finish_task(
        &Arc::new(another_user),
        program,
        next_task_pda,
        VALID_CID.to_string(),
    )
    .await;

    assert!(res.is_err_and(|e| {
        match e {
            ClientError::SolanaClientError(e) => true,
            _ => false,
        }
    }));
}

#[tokio::test]
async fn should_not_finish_task_with_non_in_progress_status() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    finish_task(user, program, next_task_pda, VALID_CID.to_string())
        .await
        .expect("Failed sending finish task request");

    let task = program
        .account::<Task>(next_task_pda)
        .await
        .expect("Failed getting task");

    assert_eq!(task.status, TaskStatus::Voting);

    let res = finish_task(user, program, next_task_pda, VALID_CID.to_string()).await;

    assert!(res.is_err_and(|e| {
        match e {
            ClientError::SolanaClientError(e) => true,
            _ => false,
        }
    }));
}

#[tokio::test]
async fn should_vote_task_and_change_status_to_success() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    finish_task(user, program, next_task_pda, VALID_CID.to_string())
        .await
        .expect("Failed sending finish task request");

    for i in 0..5 {
        let another_user = Arc::new(Keypair::new());
        
        vote_task(&another_user, program, next_task_pda, 1)
            .await
            .expect("Failed to send vote task request");
        
        let task = program
            .account::<Task>(next_task_pda)
            .await
            .expect("Failed getting task");

        if i == 4 {
            assert_eq!(task.status, TaskStatus::Success);
        } else {
            assert_eq!(task.status, TaskStatus::Voting);
        }
    }
}

#[tokio::test]
async fn should_vote_task_and_change_status_to_fail() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    finish_task(user, program, next_task_pda, VALID_CID.to_string())
        .await
        .expect("Failed sending finish task request");

    for i in 0..5 {
        let another_user = Arc::new(Keypair::new());
        vote_task(&another_user, program, next_task_pda, 0)
            .await
            .expect("Failed to send vote task request");

        let task = program
            .account::<Task>(next_task_pda)
            .await
            .expect("Failed getting task");

        if i == 4 {
            assert_eq!(task.status, TaskStatus::Fail);
        } else {
            assert_eq!(task.status, TaskStatus::Voting);
        }
    }
}

#[tokio::test]
async fn should_not_vote_task_twice() {
    let context = get_test_context_cached().await;
    let TestContext {
        program,
        user: doer,
    } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(doer, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(doer, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    finish_task(doer, program, next_task_pda, VALID_CID.to_string())
        .await
        .expect("Failed sending finish task request");

    let another_user = Arc::new(Keypair::new());

    vote_task(&another_user, program, next_task_pda, 1)
        .await
        .expect("Failed to send vote task request");

    let res = vote_task(&another_user, program, next_task_pda, 1).await;

    assert!(res.is_err_and(|e| {
        match e {
            ClientError::SolanaClientError(e) => true,
            _ => false,
        }
    }));
}

#[tokio::test]
async fn should_not_vote_own_task() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    finish_task(user, program, next_task_pda, VALID_CID.to_string())
        .await
        .expect("Failed sending finish task request");

    let res = vote_task(&user, program, next_task_pda, 1).await;

    assert!(res.is_err_and(|e| {
        match e {
            ClientError::SolanaClientError(e) => true,
            _ => false,
        }
    }));
}

#[tokio::test]
async fn should_not_vote_task_with_non_voting_status() {
    let context = get_test_context_cached().await;
    let TestContext { program, user } = context.deref();

    let next_task_pda = get_next_task_pda().await;

    let name = Uuid::new_v4().to_string();
    let description = "description".to_string();
    let time_to_solve_s = 5555;

    create_task(user, program, (name, description, time_to_solve_s))
        .await
        .expect("Failed sending create task request");

    take_task(user, program, next_task_pda)
        .await
        .expect("Failed sending take task request");

    let another_user = Arc::new(Keypair::new());

    let res = vote_task(&another_user, program, next_task_pda, 1).await;

    assert!(res.is_err_and(|e| {
        match e {
            ClientError::SolanaClientError(e) => true,
            _ => false,
        }
    }));
}
