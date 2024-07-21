import Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

export async function saveBufferToMinio(bucketName, fileName, buffer) {
    try {
        // Check if the bucket exists
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            // Create the bucket if it does not exist
            await minioClient.makeBucket(bucketName, 'us-east-1'); // Change region as needed
            console.log(`Bucket ${bucketName} created successfully.`);
        }

        // Upload the buffer to the bucket
        await minioClient.putObject(bucketName, fileName, buffer, {
            'Content-Type': 'image/png'
        });

        // Return the file URL
        const fileUrl = `${process.env.MINIO_URL}/${bucketName}/${fileName}`;
        return fileUrl;
    } catch (err) {
        console.error('Error uploading to Minio:', err);
        throw err;
    }
}
