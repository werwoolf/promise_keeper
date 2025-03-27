import {useCallback, useContext} from "react";
import {ModalProviderContext} from "./ModalProvider.tsx";
import ProfileModal from "./ProfileModal.tsx";

const ProfileButton = () => {
    const {openModal} = useContext(ModalProviderContext);

    const handleClick = useCallback(() => {
        openModal(ProfileModal)
    }, [openModal])
    return (
        <button onClick={handleClick}>
            Account
        </button>
    );
};

export default ProfileButton;
