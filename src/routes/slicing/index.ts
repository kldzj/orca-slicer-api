import { Router } from "express";
import single from "./single.route";
import multi from "./multi.route";

const router = Router();

router.use("/single", single);
router.use("/multi", multi);

export default router;
