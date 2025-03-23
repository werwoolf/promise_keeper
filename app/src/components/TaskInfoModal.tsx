import {ModalContentWrapper} from "./ModalContentWrapper.tsx";
import {Task} from "../App.tsx";
import {FC, ReactNode} from "react";
import {capitalize} from "lodash";
import {Disclosure} from "@headlessui/react";
import classNames from "classnames";
import {useUserGetImgUrlFromCID} from "../hooks/userGetImgUrlFromCID.ts";
import dayjs from "dayjs";

const InfoItem: FC<{ title: string, children: ReactNode }> = ({children, title}) => {
    return <div className="w-full flex justify-between border-b border-gray-200 py-1">
        <div>{title}</div>
        <div>{children}</div>
    </div>
}

interface TaskInfoModalProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

const TaskInfoModal: FC<TaskInfoModalProps> = ({open, task, onClose}) => {
    const {imgUrl, isLoading} = useUserGetImgUrlFromCID(task.account.imgProofHash);
    const {account, publicKey} = task;

    return (
        <ModalContentWrapper title={account.name} open={open} onClose={onClose}>
            {(!!imgUrl || isLoading) && <img alt="proof" src={imgUrl}/>}
            <div className="space-y-1">
                <InfoItem title="Name">
                    {account.name}
                </InfoItem>
                <InfoItem title="Description">
                    {account.description || "..."}
                </InfoItem>
                <InfoItem title="Public key">
                    {publicKey.toString()}
                </InfoItem>
                <InfoItem title="Status">
                    {capitalize(Object.keys(account.status).toString())}
                </InfoItem>
                <InfoItem title="Doer">
                    {account.userId ? account.userId.toString() : "-"}
                </InfoItem>
                <InfoItem title="Due date">
                    {account.dueDateS ? dayjs(parseInt(account.dueDateS, 16) * 1000).format("DD-MM-YYYY, HH:mm:ss") : "-"}
                </InfoItem>
                <Disclosure as="div">
                    <Disclosure.Button
                        as="div"
                        disabled={!account.approveVotes.length}
                        className={classNames({"cursor-pointer": !!account.approveVotes.length})}
                    >
                        <InfoItem title="Approves votes">
                            {account.approveVotes.length}
                        </InfoItem>
                    </Disclosure.Button>
                    <Disclosure.Panel>
                        {account.approveVotes.map((pubKey) => <div
                            key={publicKey.toString()}>{pubKey.toString()}</div>)}
                    </Disclosure.Panel>
                </Disclosure>
                <Disclosure as="div">
                    <Disclosure.Button
                        as="div"
                        disabled={!account.disapproveVotes.length}
                        className={classNames({"cursor-pointer": !!account.disapproveVotes.length})}
                    >
                        <InfoItem title="Disapprove votes">
                            {account.disapproveVotes.length}
                        </InfoItem>
                    </Disclosure.Button>
                    <Disclosure.Panel>
                        {account.disapproveVotes.map((pubKey) => <div
                            key={publicKey.toString()}>{pubKey.toString()}</div>)}
                    </Disclosure.Panel>
                </Disclosure>
            </div>
        </ModalContentWrapper>
    );
};

export default TaskInfoModal;
