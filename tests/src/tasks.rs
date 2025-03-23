use anchor_lang::declare_program;

declare_program!(promise_keeper);
use promise_keeper::{accounts::User, client::accounts, client::args};

#[tokio::test]
async fn should_find_task_counter_account() {}

#[tokio::test]
async fn should_update_task_counter_account() {}

#[tokio::test]
async fn should_not_create_task_with_invalid_data() {}

#[tokio::test]
async fn should_create_task_with_valid_data() {}

#[tokio::test]
async fn should_get_all_tasks() {}

#[tokio::test]
async fn should_take_task() {}

#[tokio::test]
async fn should_not_take_already_taken_task() {}

#[tokio::test]
async fn should_finish_task() {}

#[tokio::test]
async fn should_not_finish_task_with_invalid_image_proof_hash() {}

#[tokio::test]
async fn should_not_finish_someones_else_task() {}

#[tokio::test]
async fn should_not_finish_task_with_non_in_progress_status() {}

#[tokio::test]
async fn should_vote_task_and_change_status_to_success() {}

#[tokio::test]
async fn should_vote_task_and_change_status_to_fail() {}

#[tokio::test]
async fn should_not_vote_task_twice() {}

#[tokio::test]
async fn should_not_vote_own_task() {}

#[tokio::test]
async fn should_not_vote_task_with_non_voting_status() {}
