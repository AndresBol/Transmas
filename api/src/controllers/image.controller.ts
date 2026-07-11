import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ImageService } from "../services/image.service";
import { uploadImage } from "../middlewares/image-config.middleware";

const imageService = new ImageService();

export class ImageController {
    upload = (request: Request, response: Response, next: NextFunction): void => {
        uploadImage(request, response, (error: unknown): void => {
            if (error instanceof multer.MulterError) {
                response.status(400).json({
                    message:
                        error.code === "LIMIT_FILE_SIZE"
                            ? "The image must not exceed 2 MB"
                            : error.message,
                });
                return;
            }

            if (error instanceof Error) {
                response.status(400).json({
                    message: error.message,
                });
                return;
            }

            imageService
                .uploadImage(request.file)
                .then((fileName) => {
                    response.status(200).json({
                        message: "Image uploaded successfully",
                        fileName,
                    });
                })
                .catch((error: unknown) => {
                    next(error);
                });
        });
    };

    listFiles = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const files = await imageService.listImages();
            response.status(200).json({ success: true, data: files });
        } catch (error) {
            next(error);
        }
    };

    download = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const fileNameParam = request.params["name"];

            if (typeof fileNameParam !== "string") {
                return response.status(400).json({
                    message: "Invalid image name",
                });
            }

            const filePath = imageService.getImagePath(fileNameParam);
            return response.download(filePath, fileNameParam);
        } catch (error) {
            next(error);
        }
    };
}
