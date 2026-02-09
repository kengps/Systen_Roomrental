// FileUploadPreviewModal.jsx

// import { useFileUpload } from "@/hooks/useFileUpload";
// import { useFileUploadContext } from "@/shared/context/FileUploadContext";
import {
    DeleteOutlined,
    EyeOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Image,
    message,
    Modal,
    Spin,
    Typography,
    Upload
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useFileUploadContext } from "../../../service/context/FileUploadContext";
import { useFileUpload } from "../../../utilities/hooks/useFileUpload";

const FileUploadPreviewModal = ({
    display,
    onUploaded,
    onCleared,
    isPreview = true,
    errors,
    clearErrors,
    fileList,
    setFileList
}) => {
    const {
        file,
        setFile,
        previewUrl,
        setPreviewUrl,
        uploadedFileKey,
        setUploadedFileKey,
        uploading,
        uploadError,
    } = useFileUploadContext();

    const { uploadFileToS3 } = useFileUpload();
    const [openModal, setOpenModal] = useState(false);

    const handleFileChange = async (info) => {
        const selected = info.fileList[0]?.originFileObj;

        // 🔥 เคลียร์ blob URL เดิม
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        // เคลียร์ state
        setPreviewUrl(null);
        setUploadedFileKey(null);
        setFileList([]); // เคลียร์ fileList

        // ตั้งค่าใหม่
        if (selected) {
            const tempPreviewUrl = URL.createObjectURL(selected);
            setPreviewUrl(tempPreviewUrl);
            setFile(selected);
            setFileList([info.fileList[0]]); // อัปเดต fileList ใหม่ให้ Upload
            await uploadFileToS3(selected);
        }
    };



    useEffect(() => {

        if (uploadedFileKey && onUploaded) {
            onUploaded(uploadedFileKey);
            clearErrors?.("content.photoUrl");
        }
    }, [uploadedFileKey]);


    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const clearFile = async () => {
        if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setFile(null);
        setPreviewUrl(null);
        setUploadedFileKey(null);
        setFileList([]); // 👈 สำคัญ!
        if (uploadedFileKey) {
            try {
                await axios.delete(`${import.meta.env.VITE_REACT_APP_API}/upload/file?key=${uploadedFileKey}`);
                onCleared?.();
            } catch (err) {
                message.error("ลบไฟล์ไม่สำเร็จ");
            }
        } else {
            onCleared?.();
        }
    };


    return (
        <Card
            variant="outlined"
            style={{ border: "1px dashed #ccc", textAlign: "center", marginBottom: 16 }}
        >
            <Upload
                showUploadList={false}
                beforeUpload={() => false} // ไม่ให้ antd อัปโหลดเอง
                fileList={fileList} // 👈 ควบคุมเอง
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/gif"
                disabled={uploading || display}
            >
                <Button icon={<UploadOutlined />} disabled={uploading || display}>
                    {uploading ? "Uploading..." : "อัปโหลดสลิป"}
                </Button>
            </Upload>

            {uploading && (
                <div style={{ marginTop: 16 }}>
                    <Spin />
                    <Typography.Text>Uploading...</Typography.Text>
                </div>
            )}

            {previewUrl && !uploading && (
                <Card
                    size="small"
                    style={{
                        marginTop: 16,
                        display: "flex",
                        justifyContent: "center", // 👈 รูปอยู่ตรงกลาง
                        alignItems: "center",
                        position: "relative",      // 👈 เพื่อจัดวางปุ่ม
                    }}
                >
                    {/* รูปภาพอยู่ตรงกลาง */}
                    <Image
                        src={previewUrl}
                        alt="preview"
                        width={150}
                        height={150}
                        style={{
                            objectFit: "cover",
                            borderRadius: 8,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                        }}
                        preview={false}
                    />

                    {/* ปุ่มอยู่ขวาบน */}
                    <div
                        style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)", // 👈 จัดกลางตามแนวตั้ง
                            display: "flex",
                            flexDirection: "column",       // ปุ่มเรียงแนวตั้ง
                            gap: 8,
                        }}
                    >
                        {isPreview && (
                            <Button
                                icon={<EyeOutlined />}
                                type="text"
                                onClick={() => setOpenModal(true)}
                            />
                        )}
                        {!!display && (
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                type="text"
                                onClick={clearFile}
                            />
                        )}
                    </div>
                </Card>
            )}

            <Modal
                open={openModal}
                footer={null}
                onCancel={() => setOpenModal(false)}
                centered
            >
                <Typography.Title level={5}>Preview Image</Typography.Title>
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt="preview"
                        style={{ maxWidth: "100%", borderRadius: 8 }}
                    />
                ) : (
                    <Typography.Text>No preview available</Typography.Text>
                )}
            </Modal>

            {uploadError && (
                <Typography.Text type="danger" style={{ display: "block", marginTop: 8 }}>
                    {uploadError}
                </Typography.Text>
            )}

            {errors?.message && (
                <Typography.Text type="danger">{errors.message}</Typography.Text>
            )}
        </Card>
    );
};

export default FileUploadPreviewModal;
