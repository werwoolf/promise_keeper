import {ModalContentWrapper} from "./ModalContentWrapper.tsx";
import {ChangeEvent, FC, useCallback, useState} from "react";
import {Button} from "@headlessui/react";
import {CreateTaskData} from "../types.ts";
import {mapSecondsToStringDuration, mapStringDurationToSeconds} from "../utils/duration.ts";
import {useCreateTaskMutation} from "../queries/task.ts";

const initData: CreateTaskData = {name: "", description: "", timeToSolveS: 3600};

interface CreateTaskModalProps {
    open: boolean;
    onClose: () => void;
}

const CreateTaskModal: FC<CreateTaskModalProps> = ({open, onClose}) => {
    const [data, setData] = useState<CreateTaskData>(initData);
    const {mutateAsync: createTask} = useCreateTaskMutation();

    const {name, description} = data;

    const handleCreateTask = useCallback(async () => {
        await createTask(data);
        onClose();
    }, [createTask, data, onClose]);

    const handleChangeName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setData(data => ({...data, name: e.target.value}))
    }, []);
    const handleChangeDescription = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setData(data => ({...data, description: e.target.value}))
    }, []);
    const handleChangeTimeToSolve = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setData(data => ({...data, timeToSolveS: mapStringDurationToSeconds(e.target.value)}))
    }, []);

    return (
        <ModalContentWrapper title="Add new task" open={open} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <input placeholder="Task name" value={name} onChange={handleChangeName}/>
                <input placeholder="Task description" value={description} onChange={handleChangeDescription}/>
                <div>
                    <label className="mr-4">Time to solve task</label>
                    <input
                        type="time"
                        onChange={handleChangeTimeToSolve}
                        value={mapSecondsToStringDuration(data.timeToSolveS)}
                    />
                </div>

                <Button onClick={handleCreateTask}>Create</Button>
            </div>
        </ModalContentWrapper>
    );
};

export default CreateTaskModal;
