import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interesseRouter from "./interesse";
import stimmungRouter from "./stimmung";
import beaconRouter from "./beacon";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interesseRouter);
router.use(stimmungRouter);
router.use(beaconRouter);

export default router;
