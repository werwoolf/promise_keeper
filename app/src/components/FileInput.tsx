import {ChangeEvent, FC, useCallback, useState} from "react";
import {ipfs} from "../main.tsx";

export type Value = { name: string, content: ArrayBuffer | string };

interface FileInputProps {
    placeholder: string;
    showPreview?: boolean;
    onChange: (cid: string) => void
}

const FileInput: FC<FileInputProps> = ({placeholder, showPreview, onChange}) => {
    const [uploadedFile, setUploadedFile] = useState<Value>();

    const handleLoadImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async () => {
            const content = reader.result!;
            const result = await ipfs.add(content);

            setUploadedFile({name: file.name, content: URL.createObjectURL(file)})

            onChange(result.cid.toString())
        };

        reader.readAsArrayBuffer(file);
    }, [onChange]);
    return (
        <div>
            <label
                htmlFor="file"
                className="block border border-dashed border-gray-500 rounded text-center cursor-pointer hover:bg-gray-100 p-3"
            >
                {
                    (uploadedFile && showPreview)
                        ? <div className="flex flex-row gap-6 items-center">
                            <img src={uploadedFile?.content?.toString()} alt={uploadedFile.name}/>
                            <span>{uploadedFile.name}</span>
                        </div>
                        : <span>{placeholder}</span>
                }
            </label>
            <input accept="image/*" id="file" type="file" className="hidden" onChange={handleLoadImage}/>
        </div>

    )
};

export default FileInput;
