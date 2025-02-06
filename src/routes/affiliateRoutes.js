// Suggested code may be subject to a license. Learn more: ~LicenseLog:802815958.
const express = require("express");
const router = express.Router();
const {isAuthenticated,checkRoleOrPermission} = require("../middleware/authMiddleware");
const {
  getAllAffiliates,
  getAffiliateById,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
} = require("../controllers/affiliateController");

router.get("/affiliates",isAuthenticated, checkRoleOrPermission('READ_AFFILATE'), getAllAffiliates);
router.get("/affiliate/:id",isAuthenticated, checkRoleOrPermission("READ_AFFILATE"), getAffiliateById);
router.post("/affiliate",isAuthenticated, checkRoleOrPermission("CREATE_AFFILATE"), createAffiliate);
router.put("/affiliate/:id",isAuthenticated, checkRoleOrPermission("UPDATE_AFFILATE"), updateAffiliate);
router.delete("/affiliate/:id",isAuthenticated, checkRoleOrPermission("DELETE_AFFILATE"), deleteAffiliate);

module.exports = router;
