import { Router } from "express";
import { ImageController } from "../controllers/image.controller";

export class ImageRoutes {
    static get routes(): Router {
        const router = Router();
        const imageController = new ImageController();

        router.post("/upload", imageController.upload);
        router.get("/files", imageController.listFiles);
        router.get("/download/:name", imageController.download);

        return router;
    }
}
