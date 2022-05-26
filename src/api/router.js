const router = require("express").Router();
const ctl = require("./controller.js");

router.get("/", ctl.main)

router.get("/service/:id", ctl.getService);
router.get("/services", ctl.getServices);
router.get("/services_count", ctl.getServiceCount);
router.post("/call", ctl.postCall);

module.exports = router;