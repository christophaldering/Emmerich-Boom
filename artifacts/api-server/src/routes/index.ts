import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interesseRouter from "./interesse";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interesseRouter);

export default router;
