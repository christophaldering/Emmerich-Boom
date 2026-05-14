import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interesseRouter from "./interesse";
import stimmungRouter from "./stimmung";
import beaconRouter from "./beacon";
import ticketsRouter from "./tickets";
import anmeldungRouter from "./anmeldung";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interesseRouter);
router.use(stimmungRouter);
router.use(beaconRouter);
router.use(ticketsRouter);
router.use(anmeldungRouter);

export default router;
