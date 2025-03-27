import {ModalContentWrapper} from "./ModalContentWrapper.tsx";
import {ChangeEvent, FC, useCallback, useState} from "react";
import FileInput from "./FileInput.tsx";
import {UpdateUserProfileData} from "../types.ts";
import dayjs from "dayjs";
import {useUpdateProfileMutation} from "../queries/profile.ts";

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

const ProfileModal: FC<ProfileModalProps> = ({open, onClose}) => {
    const [profileData, setProfileData] = useState<UpdateUserProfileData>({
        avatarHash: null,
        birthdate: null,
        nickname: ""
    });

    const {mutateAsync} = useUpdateProfileMutation();

    const handleChangeAvatar = useCallback((avatarHash: string) => {
        setProfileData(data => ({...data, avatarHash}))
    }, []);

    const handleChangeNickname = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setProfileData(data => ({...data, nickname: e.target.value}))
    }, []);

    const handleChangeBirthday = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setProfileData(data => ({...data, birthdate: dayjs(e.target.value).toDate().getTime()}))
    }, []);

    const handleSave = useCallback(() => {
        mutateAsync(profileData)
    }, [mutateAsync, profileData])
    return (
        <ModalContentWrapper open={open} onClose={onClose} title="Modal title">
            <div className="flex flex-col gap-3">
                <div className="space-y-1">
                    <p>Profile image</p>
                    <FileInput placeholder="Select your profile image" onChange={handleChangeAvatar}/>
                </div>
                <div className="space-y-1">
                    <p>Nickname</p>
                    <input
                        className="w-full"
                        placeholder="Nickname"
                        value={profileData.nickname}
                        onChange={handleChangeNickname}
                    />
                </div>
                <div className="space-y-1">
                    <p>Birthday</p>
                    <input
                        className="w-full"
                        placeholder="Birthday"
                        type="date"
                        onChange={handleChangeBirthday}
                    />
                </div>

                <button onClick={handleSave}>Create profile</button>
            </div>
        </ModalContentWrapper>
    );
};

export default ProfileModal;
