import {useCallback, useContext} from "react";
import {ModalProviderContext} from "./ModalProvider.tsx";
import ProfileModal from "./ProfileModal.tsx";
import {useGetProfileQuery} from "../queries/profile.ts";
import {useUserGetImgUrlFromCID} from "../hooks/userGetImgUrlFromCID.ts";
import {Button} from "./Button.tsx";
import {get} from "lodash";

const ProfileButton = () => {
    const isConnectedWallet = get(window, "solana.isConnected", false);
    const {openModal} = useContext(ModalProviderContext);
    const {data, isLoading} = useGetProfileQuery();

    const {imgUrl} = useUserGetImgUrlFromCID(data?.avatarHash);

    const handleClick = useCallback(() => {
        openModal(ProfileModal)
    }, [openModal]);
    return (
        <Button onClick={handleClick} loading={isLoading} disabled={!isConnectedWallet || isLoading}>
            {data && <div className="flex gap-2">
                {imgUrl && <img width={25} src={imgUrl} alt="avatar"/>}
                <span>{data.nickname}</span>
            </div>}
            {!data && <span>Create account</span>}
        </Button>
    );
};

export default ProfileButton;
