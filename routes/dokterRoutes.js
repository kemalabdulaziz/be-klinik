const express = require("express");
const router = express.Router();
const dokterController = require("../controllers/dokterController");

router.post("/", dokterController.createDokter);
router.get("/", dokterController.getDokter);
router.put("/:id", dokterController.updateDokter);

module.exports = router;
