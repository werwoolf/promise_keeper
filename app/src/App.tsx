import {IdlAccounts, ProgramAccount} from "@coral-xyz/anchor"
import {PromiseKeeper} from "../types/promise_keeper.ts";
import "./index.css";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import TaskListItem from "./components/TaskListItem.tsx";
import {useCallback, useContext, useEffect} from "react";
import {ModalProviderContext} from "./components/ModalProvider.tsx";
import CreateTaskModal from "./components/CreateTaskModal.tsx";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {useGetTasksQuery} from "./queries/task.ts";
import {get} from "lodash";
import {useGetProfileQuery} from "./queries/profile.ts";
import ProfileButton from "./components/ProfileButton.tsx";
import ProfileModal from "./components/ProfileModal.tsx";
import {Button} from "./components/Button.tsx";
import {queryClient} from "./main.tsx";
import {Spinner} from "./components/Spinner.tsx";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export type Task = ProgramAccount<IdlAccounts<PromiseKeeper>["task"]>;

function App() {
    const isConnectedWallet = get(window, "solana.isConnected", false);
    const {openModal} = useContext(ModalProviderContext);
    const {data: tasks, isLoading} = useGetTasksQuery(!isConnectedWallet);
    const {data: profile, isLoading: isLoadingProfile} = useGetProfileQuery();

    useEffect(() => {
        if (!isConnectedWallet) {
            queryClient.clear()
        }
    }, [isConnectedWallet]);

    const handleOpenCreateTaskModal = useCallback(() => {
        openModal(CreateTaskModal)
    }, [openModal]);

    const handleOpenProfileModal = useCallback(() => {
        openModal(ProfileModal)
    }, [openModal]);
    return (
        <div className="w-screen h-screen grid grid-rows-[auto_1fr]">
            <div className="flex border-b border-gray-500 px-3 py-2 items-center"
                 style={{backgroundColor: "rgb(224, 227, 215)"}}>
                <img src="/logo.webp" alt="Logo.webp" width={40}/>
                <div className="flex gap-2 ml-auto">
                    <ProfileButton/>
                    <WalletMultiButton style={{height: 32}}/>
                    <Button
                        loading={isLoading}
                        onClick={handleOpenCreateTaskModal}
                        disabled={!isConnectedWallet || !profile}
                    >
                        Create task
                    </Button>
                </div>

            </div>
            {!isConnectedWallet && <div className="w-full h-full flex justify-center items-center">
                <span className="text-2xl font-semibold">Please connect your wallet</span>
            </div>}
            {isConnectedWallet && !profile && !isLoadingProfile &&
                <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
                    <div className="text-2xl font-semibold">You do not have an application account yet</div>
                    <button onClick={handleOpenProfileModal}>Create account</button>
                </div>}
            {isConnectedWallet && (isLoading || isLoadingProfile) &&
                <div className="w-full h-full flex items-center justify-center">
                    <Spinner size="lg"/>
                </div>}
            {isConnectedWallet && !isLoading && !tasks?.length && <h2>There are no tasks yet</h2>}
            {
                isConnectedWallet && !isLoading && !isLoadingProfile && !!profile && !!tasks?.length &&
                <div className="w-full flex flex-col gap-2 p-2 items-center justify-center">
                    {tasks.map((task) => <TaskListItem task={task} key={task.publicKey.toString()}/>)}
                </div>
            }
        </div>
    )
}

export default App
