import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interesseRouter from "./interesse";
import stimmungRouter from "./stimmung";
import beaconRouter from "./beacon";
import ticketsRouter from "./tickets";
import anmeldungRouter from "./anmeldung";
import anmeldungAdminRouter from "./anmeldung-admin";
import displayNamesRouter from "./display-names";
import wartelisteRouter from "./warteliste";
import exportRouter from "./export";
import thekeRouter from "./theke";
import thekeAdminRouter from "./theke-admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interesseRouter);
router.use(stimmungRouter);
router.use(beaconRouter);
router.use(ticketsRouter);
router.use(anmeldungRouter);
router.use(anmeldungAdminRouter);
router.use(displayNamesRouter);
router.use(wartelisteRouter);
router.use(exportRouter);
router.use(thekeRouter);
router.use(thekeAdminRouter);

export default router;
