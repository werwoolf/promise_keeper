import dayjs from "dayjs";
import {Task} from "../App.tsx";
import {FC, useCallback, useContext, MouseEvent} from "react";
import cn from "classnames";
import {capitalize, lowerCase} from "lodash";
import {ModalProviderContext} from "./ModalProvider.tsx";
import FinishTaskModal from "./FinishTaskModal.tsx";
import {useTakeTaskMutation, useVoteTaskMutation} from "../queries/task.ts";
import {useUserGetImgUrlFromCID} from "../hooks/userGetImgUrlFromCID.ts";
import TaskInfoModal from "./TaskInfoModal.tsx";

interface TaskListItemProps {
    task: Task;
}

const TaskListItem: FC<TaskListItemProps> = ({task}) => {
    const {mutateAsync: takeTask, isPending} = useTakeTaskMutation()
    const {openModal} = useContext(ModalProviderContext);
    const {imgUrl: imgProofUrl} = useUserGetImgUrlFromCID(task.account.imgProofHash);

    const {mutateAsync: voteTask} = useVoteTaskMutation();

    const {account, publicKey} = task;
    const {name, description, status, timeToSolveS, approveVotes, disapproveVotes} = account;

    const parsedStatus = capitalize(lowerCase(Object.keys(status)[0]));
    const isTaskPending = parsedStatus === "Pending";
    const isTaskInProgress = parsedStatus === "In progress";
    const isTaskInVoting = parsedStatus === "Voting";

    const handleTakeTask = useCallback(async (e: MouseEvent) => {
        e.stopPropagation();
        await takeTask(publicKey)
    }, [publicKey, takeTask]);

    const handleOpenFinishTaskModal = useCallback((e: MouseEvent) => {
        e.stopPropagation()
        openModal(FinishTaskModal, {task})
    }, [openModal, task]);

    const handleVote = useCallback((approve: 0 | 1, e: MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
        voteTask({approve, taskPubKey: task.publicKey})
    }, [task.publicKey, voteTask])

    const handleOpenTaskInfoModal = useCallback(() => {
        openModal(TaskInfoModal, {task})
    }, [openModal, task])

    return (
        <div
            className="w-full max-w-[700px] flex border border-gray-200 justify-between items-center rounded py-0.5 px-2 group cursor-pointer shadow-[0_0_0_0_#1717171a] transition-all duration-300 hover:shadow-[0_1px_10px_6px_#1717171a]"
            onClick={handleOpenTaskInfoModal}
        >
            <div className="flex gap-2">
                {imgProofUrl && <img width={50} src={imgProofUrl}/>}
                <div>
                    <b>{name}</b><br/>
                    <span>{description || "..."}</span>
                </div>
            </div>
            {
                isTaskInVoting && <div className="flex gap-3 items-center">
                    <div className="flex gap-1 hover:bg-gray-200 p-1.5 rounded">
                        <span className="text-red-500">{disapproveVotes.length}</span>
                        <img onClick={handleVote.bind(null, 0)} width={24} src="/thumb-down-icon.svg"
                             className="relative bottom-[-4px]"/>
                    </div>
                    <div className="flex gap-1 hover:bg-gray-200 p-1.5 rounded">
                        <span className="text-green-500">{approveVotes.length}</span>
                        <img onClick={handleVote.bind(null, 1)} width={24} src="/thumb-up-icon.svg"
                             className="relative bottom-[4px]"/>
                    </div>

                </div>
            }
            <div className={cn("flex divide-x", {"group-hover:hidden": isTaskPending || isTaskInProgress})}>
                <div className="pr-1 capitalize">{dayjs.duration(timeToSolveS * 1000).humanize()}</div>
                <div className="pl-1">{parsedStatus}</div>
            </div>
            {
                isTaskPending &&
                <button disabled={isPending} className="hidden group-hover:block" onClick={handleTakeTask}>
                    Take task
                </button>
            }
            {
                isTaskInProgress &&
                <button disabled={isPending} className="hidden group-hover:block" onClick={handleOpenFinishTaskModal}>
                    Finish task
                </button>
            }

        </div>
    );
};

export default TaskListItem;
