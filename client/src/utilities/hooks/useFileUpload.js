// hooks/useFileUpload.ts

import axios from "axios";
import { useFileUploadContext } from "../../service/context/FileUploadContext";

export const useFileUpload = () => {
    const { setPreviewUrl, setUploadedFileKey, setUploading, setUploadError } =
        useFileUploadContext();

    const uploadFileToS3 = async (file) => {


        setUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_API}/upload`,
                formData
            );

            setUploadedFileKey(res.data.result.key);
            setPreviewUrl(res.data.result.location);
        } catch (err) {

            setUploadError("ไม่สามารถอัปโหลดไฟล์ได้");
        } finally {
            setUploading(false);
        }


    };

    return {
        uploadFileToS3,
    };
};
