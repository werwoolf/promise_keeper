import {ModalContentWrapper} from "./ModalContentWrapper.tsx";
import {FC, useCallback, useState} from "react";
import {Task} from "../App.tsx";
import {useFinishTaskMutation} from "../queries/task.ts";
import FileInput from "./FileInput.tsx";

interface FinishTaskModalProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

const FinishTaskModal: FC<FinishTaskModalProps> = ({task, open, onClose}) => {
    const [proofCID, setProofCID] = useState<string>();

    const {mutateAsync: finishTask} = useFinishTaskMutation();

    const handleFinishTask = useCallback(async () => {
        await finishTask({proofCID: proofCID!, taskPubKey: task.publicKey});

        onClose();
    }, [finishTask, onClose, proofCID, task.publicKey]);

    const handleChangeImage = useCallback((cid: string) => {
        setProofCID(cid);
    }, []);

    return (
        <ModalContentWrapper title="Finish task" open={open} onClose={onClose}>
            <div className="text-end">
                <FileInput
                    placeholder="Select photo to prove your task completion"
                    onChange={handleChangeImage}
                />
                <button
                    className="mt-3"
                    disabled={!proofCID}
                    onClick={handleFinishTask}
                >
                    Finish
                </button>
            </div>

        </ModalContentWrapper>
    );
};

export default FinishTaskModal;
