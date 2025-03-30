use crate::defaults::{
    TASK_DESCRIPTION_MAX_LENGTH, TASK_DESCRIPTION_MIN_LENGTH, TASK_NAME_MAX_LENGTH,
    TASK_NAME_MIN_LENGTH, USER_MAX_BIRTH_DATE, USER_MIN_BIRTH_DATE, USER_NICKNAME_MAX_LENGTH,
    USER_NICKNAME_MIN_LENGTH, TASK_MIM_TIME_TO_SOLVE_S, TASK_MAX_TIME_TO_SOLVE_S
};
use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,

    #[msg("Only task with status \"In progress\" can be finished.")]
    CanNotFinishTask,

    #[msg("Only task with status \"Voting\" can be voted.")]
    CanNotVoteTask,

    #[msg("You have already voted this task")]
    CanNotVoteTaskSecondTime,

    #[msg("You have already voted this task.")]
    TaskAlreadyVoted,

    #[msg("Task already taken.")]
    TaskAlreadyTaken,

    #[msg("The task time has expired.")]
    TaskStale,

    #[msg("Internal program error.")]
    InternalError,

    // User data errors
    #[msg(format!("Length on nickname must be between {} and {} symbols", USER_NICKNAME_MIN_LENGTH, USER_NICKNAME_MAX_LENGTH))]
    NicknameLength,
    #[msg(format!("Birthdate must be between {} and {} seconds since unix timestamp", USER_MIN_BIRTH_DATE, USER_MAX_BIRTH_DATE))]
    BirthDate,
    #[msg(format!("Avatar must be valid IPFS CID."))]
    Avatar,
    
    
    // Task data errors
    #[msg(format!("Length on name must be between {} and {} symbols", TASK_NAME_MIN_LENGTH, TASK_NAME_MAX_LENGTH))]
    NameLength,
    
    #[msg(format!("Length on description must be between {} and {} symbols", TASK_DESCRIPTION_MIN_LENGTH, TASK_DESCRIPTION_MAX_LENGTH))]
    DescriptionLength,
    
    #[msg(format!("Time to solve must be between {} and {} seconds", TASK_MIM_TIME_TO_SOLVE_S, TASK_MAX_TIME_TO_SOLVE_S))]
    TimeToSolve,
    
    #[msg(format!("Image proof hash must be valid IPFS CID."))]
    ImgProof,
}

