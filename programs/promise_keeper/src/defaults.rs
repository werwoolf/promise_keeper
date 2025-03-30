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
pub const USER_NICKNAME_MAX_LENGTH: u8 = 30;

#[constant]
pub const USER_MIN_BIRTH_DATE: u64 = 1; // January 1, 1970 (start of unix timestamp)

#[constant]
pub const USER_MAX_BIRTH_DATE: u64 = 1_577_836_800;  // January 1, 2020

#[constant]
pub const TASK_NAME_MIN_LENGTH: u8 = 3;

#[constant]
pub const TASK_NAME_MAX_LENGTH: u8 = 36;

#[constant]
pub const TASK_DESCRIPTION_MIN_LENGTH: u8 = 3;

#[constant]
pub const TASK_DESCRIPTION_MAX_LENGTH: u8 = 100;

#[constant]
pub const TASK_MIM_TIME_TO_SOLVE_S: u32 = 3600; // 1 hour

#[constant]
pub const TASK_MAX_TIME_TO_SOLVE_S: u32 = 432_000; // 5 days

#[constant]
pub const TASK_APPROVE_VOTES_TREASURE: u8 = 5;

#[constant]
pub const TASK_DISAPPROVE_VOTES_TREASURE: u8 = 5;

#[constant]
pub const CID_V1_LENGTH: u8 = 59;

