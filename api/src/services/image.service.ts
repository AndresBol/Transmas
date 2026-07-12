import fs from "fs/promises";
import path from "path";

const uploadDir = path.join(process.cwd(), "assets", "uploads");
const defaultImage = "image-not-found.svg";
type UploadedFile = {
    filename: string;
};

export class ImageService {
    async uploadImage(file?: UploadedFile) {
        if (!file) {
            throw new Error("An image must be selected");
        }

        return file.filename;
    }

    async deleteImageIfExists(fileName: string) {
        const safeFileName = path.basename(fileName);

        if (safeFileName === defaultImage) {
            return;
        }

        const filePath = path.join(uploadDir, safeFileName);

        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
        } catch {
            // A missing previous image does not block the new upload.
        }
    }

    async listImages() {
        const files = await fs.readdir(uploadDir);
        return files;
    }

    getImagePath(fileName: string) {
        const safeFileName = path.basename(fileName);
        return path.join(uploadDir, safeFileName);
    }
}
