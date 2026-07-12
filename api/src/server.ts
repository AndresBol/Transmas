import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { AppRoutes } from "./routes/routes";
import { ErrorMiddleware } from "./middlewares/error.middleware";

const app = express();

dotenv.config();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.get("/", (req, res) => {
    res.json({
        message: "Transmas API is running",
    });
});

app.use(AppRoutes.routes);
app.use("/images", express.static(path.join(path.resolve(), "assets/uploads")));
app.use(ErrorMiddleware.handleError);

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log("Press CTRL-C to stop the server\n");
});
