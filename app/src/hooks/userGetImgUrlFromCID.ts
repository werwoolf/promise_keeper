import {useEffect, useState} from "react";
import {ipfs} from "../main.tsx";

export const useUserGetImgUrlFromCID = (cid?: string | null) => {
    const [imgUrl, setImgUrl] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!cid) return;
        (async () => {
            setIsLoading(true);
            const fileStream = ipfs.cat(cid); // todo: errors

            const chunks = [];
            for await (const chunk of fileStream) {
                chunks.push(chunk);
            }

            const blob = new Blob([Buffer.concat(chunks)]);

            setImgUrl(URL.createObjectURL(blob))
            setIsLoading(false);
        })()

    }, [cid]);

    return {imgUrl, isLoading}
}
