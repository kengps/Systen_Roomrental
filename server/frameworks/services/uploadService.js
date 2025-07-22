const {
    S3Client,
    HeadObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

class UploadService {
    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    async checkIfFileExists(key) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        };

        try {
            await this.s3.send(new HeadObjectCommand(params));
            return true;
        } catch (error) {
            if (error.name === 'NotFound') return false;
            console.error('Error checking file:', error.message);
            throw error;
        }
    }

    async uploadFile(file) {

        const fileExtension = file.name.split('.').pop();
        const filename = `${Date.now()}.${fileExtension}`; // ใช้ Date.now() เสมอ

        const buffer = await file.arrayBuffer(); // Hono file is a Blob

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `apartments/uploads/${filename}`,
            Body: Buffer.from(buffer),
            ContentType: file.type,
        };

        await this.s3.send(new PutObjectCommand(params));

        return {
            key: `apartments/uploads/${filename}`,
            location: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/apartments/uploads/${filename}`,
        };
    }

    async deleteFile(key) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        };

        await this.s3.send(new DeleteObjectCommand(params));
        console.log(`Deleted: ${key}`);
    }
}

module.exports = new UploadService();
