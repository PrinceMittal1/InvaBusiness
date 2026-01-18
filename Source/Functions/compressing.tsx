import { Image } from 'react-native-compressor';

const compressImage = async (uri: string) => {
    try {
        const compressedUri = await Image.compress(uri, {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.65,   // 65% quality — WhatsApp level
        });

        return compressedUri; // new compressed file path
    } catch (error) {
        console.log("Compression error:", error);
        return null;
    }
};


export default compressImage