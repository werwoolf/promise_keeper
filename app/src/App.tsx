import {IdlAccounts, ProgramAccount} from "@coral-xyz/anchor"
import {PromiseKeeper} from "../types/promise_keeper.ts";
import "./index.css";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import TaskListItem from "./components/TaskListItem.tsx";
import {useCallback, useContext} from "react";
import {ModalProviderContext} from "./components/ModalProvider.tsx";
import CreateTaskModal from "./components/CreateTaskModal.tsx";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {useGetTasksQuery} from "./queries.ts";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export type Task = ProgramAccount<IdlAccounts<PromiseKeeper>["task"]>;

function App() {
    const {openModal} = useContext(ModalProviderContext);
    const {data: tasks, isLoading} = useGetTasksQuery();

    console.log(tasks)

    const handleOpenCreateTaskModal = useCallback(() => {
        openModal(CreateTaskModal)
    }, [openModal]);
    return (
        <div className="w-screen h-screen grid grid-rows-[auto_1fr]">
            <div className="flex border-b border-gray-500 px-3 py-2 items-center"
                 style={{backgroundColor: "rgb(224, 227, 215)"}}>
                <img src="/logo.webp" alt="Logo.webp" width={40}/>
                <div className="flex gap-2 ml-auto">
                    <WalletMultiButton style={{height: 32}}/>
                    <button onClick={handleOpenCreateTaskModal}>
                        Create task
                    </button>
                </div>

            </div>
            {isLoading && "Loading..."}
            {!isLoading && !tasks?.length && <h2>There are no tasks yet</h2>}
            {
                !isLoading && !!tasks?.length &&
                <div className="w-full flex flex-col gap-2 p-2 items-center justify-center">
                    {tasks.map((task) => <TaskListItem task={task} key={task.publicKey.toString()}/>)}
                </div>
            }
        </div>
    )
}

export default App
