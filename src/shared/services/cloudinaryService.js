const CLOUD_NAME = 'dcnffehhr';
const UPLOAD_PRESET = 'appchat_upload';

// Service này gửi api upload hình ảnh/video đến Cloudinary
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // Tự động nhận diện resource_type (image hoặc video)
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

    try {
        // base url of cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        console.log(data);
        return {
            url: data.secure_url, // url trả về từ Cloudinary
            type: resourceType, // 'image' hoặc 'video'
            format: data.format // đuôi file
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};
