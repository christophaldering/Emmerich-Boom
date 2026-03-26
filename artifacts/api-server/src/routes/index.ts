import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interesseRouter from "./interesse";
import stimmungRouter from "./stimmung";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interesseRouter);
router.use(stimmungRouter);

export default router;
