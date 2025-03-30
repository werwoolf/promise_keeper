use anchor_lang::constant;

#[constant]
pub const TASK_IDENTIFIER: &[u8] = b"task";

#[constant]
pub const TASK_COUNTER_IDENTIFIER: &[u8] = b"task_counter";

#[constant]
pub const USER_IDENTIFIER: &[u8] = b"user";

#[constant]
pub const USER_NICKNAME_MIN_LENGTH: u8 = 3;

#[constant]
pub const USER_NICKNAME_MAX_LENGTH: u8 = 12;

#[constant]
pub const USER_MIN_BIRTH_DATE: u64 = 3;

#[constant]
pub const USER_MAX_BIRTH_DATE: u64 = 3;

#[constant]
pub const TASK_NAME_MIN_LENGTH: u64 = 3;

#[constant]
pub const TASK_NAME_MAX_LENGTH: u64 = 3;

#[constant]
pub const TASK_DESCRIPTION_MIN_LENGTH: u64 = 3;

#[constant]
pub const TASK_DESCRIPTION_MAX_LENGTH: u64 = 3;

#[constant]
pub const TASK_MIM_TIME_TO_SOLVE_S: u64 = 3;

#[constant]
pub const TASK_MAX_TIME_TO_SOLVE_S: u64 = 3;

#[constant]
pub const TASK_APPROVE_VOTES_TREASURE: u64 = 5;

#[constant]
pub const TASK_DISAPPROVE_VOTES_TREASURE: u64 = 5;

#[constant]
pub const CID_V1_LENGTH: u8 = 59;

