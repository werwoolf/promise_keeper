import {ModalContentWrapper} from "./ModalContentWrapper.tsx";
import {ChangeEvent, FC, useCallback, useState} from "react";
import {Task} from "../App.tsx";
import {useFinishTaskMutation} from "../queries.ts";
import {ipfs} from "../main.tsx";

interface FinishTaskModalProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

const FinishTaskModal: FC<FinishTaskModalProps> = ({task, open, onClose}) => {
    const [proofCID, setProofCID] = useState<string>();
    const [uploadedFile, setUploadedFile] = useState<{ name: string, content: ArrayBuffer | string }>();

    const {mutateAsync: finishTask} = useFinishTaskMutation();

    const handleLoadImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async () => {
            const content = reader.result!;
            setUploadedFile({name: file.name, content: URL.createObjectURL(file)})

            const result = await ipfs.add(content!); // todo: error handling
            setProofCID(result.cid.toString());
        };

        reader.readAsArrayBuffer(file);
    }, []);

    const handleFinishTask = useCallback(async () => {
        await finishTask({proofCID: proofCID!, taskPubKey: task.publicKey});

        onClose();
    }, [finishTask, onClose, proofCID, task.publicKey]);

    return (
        <ModalContentWrapper title="Finish task" open={open} onClose={onClose}>
            <div className="text-end">
                <label
                    htmlFor="file"
                    className="block border border-dashed border-gray-500 rounded text-center cursor-pointer hover:bg-gray-100 p-3"
                >
                    {
                        uploadedFile
                            ? <div className="flex flex-row gap-6 items-center">
                                <img src={uploadedFile?.content?.toString()} alt={uploadedFile.name}/>
                                <span>{uploadedFile.name}</span>
                            </div>
                            : <span>Select photo to prove your task completion</span>
                    }
                </label>
                <input accept="image/*" id="file" type="file" className="hidden" onChange={handleLoadImage}/>
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
