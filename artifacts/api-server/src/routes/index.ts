import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import alumnosRouter from "./alumnos";
import operacionesRouter from "./operaciones";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(alumnosRouter);
router.use(operacionesRouter);

export default router;
