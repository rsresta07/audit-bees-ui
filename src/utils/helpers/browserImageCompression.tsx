import imageCompression from "browser-image-compression";

export async function handleImageCompression(imageFile: any) {
    const options = {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        maxIteration: 15,
    };
    try {
        return await imageCompression(imageFile, options);
    } catch (error) {
        console.log(error);
    }
}