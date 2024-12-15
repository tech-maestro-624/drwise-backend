// Suggested code may be subject to a license. Learn more: ~LicenseLog:802815958.
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllAffiliates,
  getAffiliateById,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
} = require("../controllers/affiliateController");

router.get("/affiliates",authMiddleware.isAuthenticated, authMiddleware.checkRoleOrPermission('READ_AFFILATE'), getAllAffiliates);
router.get("/affiliate/:id",authMiddleware.isAuthenticated, authMiddleware.checkRoleOrPermission("READ_AFFILATE"), getAffiliateById);
router.post("/affiliate",authMiddleware.isAuthenticated, authMiddleware.checkRoleOrPermission("CREATE_AFFILATE"), createAffiliate);
router.put("/affiliate/:id",authMiddleware.isAuthenticated, authMiddleware.checkRoleOrPermission("UPDATE_AFFILATE"), updateAffiliate);
router.delete("/affiliate/:id",authMiddleware.isAuthenticated, authMiddleware.checkRoleOrPermission("DELETE_AFFILATE"), deleteAffiliate);

module.exports = router;
