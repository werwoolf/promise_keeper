import {PublicKey} from "@solana/web3.js";

export interface CreateTaskData {
    name: string,
    description: string,
    timeToSolveS: number
}

export interface FinishTaskData {
    proofCID: string,
    taskPubKey: PublicKey
}

export interface VoteTaskData {
    approve: 0 | 1
    taskPubKey: PublicKey
}

export interface UpdateUserProfileData {
    nickname: string,
    birthdate: number | null,
    avatarHash: string | null,
}
