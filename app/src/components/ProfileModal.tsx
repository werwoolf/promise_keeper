import {ModalContentWrapper} from "./ModalContentWrapper.tsx";
import {ChangeEvent, FC, useCallback, useEffect, useState} from "react";
import FileInput from "./FileInput.tsx";
import {UpdateUserProfileData} from "../types.ts";
import {useGetProfileQuery, useUpdateProfileMutation} from "../queries/profile.ts";
import {Spinner} from "./Spinner.tsx";
import {useUserGetImgUrlFromCID} from "../hooks/userGetImgUrlFromCID.ts";
import {Button} from "./Button.tsx";

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
    const {imgUrl: avatarUrl} = useUserGetImgUrlFromCID(profileData?.avatarHash)
    const {data, isLoading: isProfileLoading} = useGetProfileQuery();

    useEffect(() => {
        if (!!data && !isProfileLoading) {
            setProfileData({
                avatarHash: data.avatarHash,
                birthdate: data.birthdate,
                nickname: data.nickname,
            })
        }
    }, [data, isProfileLoading]);

    const {mutateAsync, isPending: isUpdateProfilePending} = useUpdateProfileMutation();

    const handleChangeAvatar = useCallback((avatarHash: string) => {
        setProfileData(data => ({...data, avatarHash}))
    }, []);

    const handleChangeNickname = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setProfileData(data => ({...data, nickname: e.target.value}))
    }, []);

    const handleChangeBirthday = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setProfileData(data => (
            {
                ...data,
                birthdate: e.target.value
            }))
    }, []);

    const handleSave = useCallback(() => {
        mutateAsync(profileData)
    }, [mutateAsync, profileData])
    return (
        <ModalContentWrapper open={open} onClose={onClose} title="Modal title">
            {isProfileLoading && <div className="h-44 flex items-center justify-center"><Spinner/></div>}
            {
                !isProfileLoading && <div className="flex flex-col gap-3">
                    {avatarUrl && <img src={avatarUrl} className="max-w-[250px] rounded-full m-auto"/>}
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
                            value={profileData.birthdate || undefined}
                            onChange={handleChangeBirthday}
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isProfileLoading || isUpdateProfilePending}
                        loading={isUpdateProfilePending}
                    >
                        {data ? "Update profile" : "Create profile"}
                    </Button>
                </div>
            }

        </ModalContentWrapper>
    );
};

export default ProfileModal;
