
import { createContext, useContext, useState } from "react";



const FileUploadContext = createContext(undefined);

export const FileUploadProvider = ({
    children,
}) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
  
    const [uploadedFileKey, setUploadedFileKey] = useState(null);
  
    const [uploading, setUploading] = useState(false);
   

    const [uploadError, setUploadError] = useState(null);

    return (
        <FileUploadContext.Provider
            value={{
                file,
                setFile,
                previewUrl,
                setPreviewUrl,
                uploading,
                setUploading,
                uploadedFileKey,
                setUploadedFileKey,
                uploadError,
                setUploadError,
            }}
        >
            {children}
        </FileUploadContext.Provider>
    );
};

export const useFileUploadContext = () => {
    const context = useContext(FileUploadContext);
    if (!context) {
        throw new Error(
            "useFileUploadContext must be used within a FileUploadProvider"
        );
    }
    return context;
};
