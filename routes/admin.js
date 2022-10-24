const express = require('express');
const router = express.Router();
let { productUpload, bannerUpload, brandUpload }=require('../multer')
const { layout, getAdminLogin, getAdminDashboard, getBlockUser, getUnBlockUser, postAddProduct, getEditProduct, postEditProduct, getDeleteProduct, getBlockVisibility, getUnblockVisibility, postAdminLogin, getOrderManagement, postChangeStatus, getCategoryManagement, postAddBrand, postEditBrand, getDeleteBrand, postAddType, getBannerManagement, postAddBanner, postEditBanner, getDeleteBanner, getReturnManagement, postReturnApproved, getSalesReport, getCouponManagement, postCouponManagement, getRemoveCoupon, getLogout, getAddProduct, getProductDetails, getUserDetails,adminValidate } = require('../controllers/adminControllers');





router.use('/',layout);
// -------------------------------login------------------------------------
router.get('/', getAdminLogin)

router.post('/', postAdminLogin)
// -------------------------------login------------------------------------


// -------------------------------dashboard------------------------------------

router.get('/dashboard', adminValidate,getAdminDashboard)
// -------------------------------dashboard------------------------------------

// -------------------------------user-details------------------------------------

router.get('/user-details', adminValidate, getUserDetails)

router.get('/block-user/:userId', adminValidate, getBlockUser)

router.get('/unblock-user/:userId', adminValidate, getUnBlockUser)
// -------------------------------user-details------------------------------------



// -------------------------------product-details------------------------------------
router.get('/product-details', adminValidate, getProductDetails)

router.get('/add-product', adminValidate, getAddProduct)

router.post('/add-product',adminValidate,productUpload.array('image'), postAddProduct)

router.get('/edit-product/:id', adminValidate, getEditProduct)

router.post('/edit-product/:id', adminValidate,productUpload.array('image'),postEditProduct)

router.get('/delete-product/:id', adminValidate,  getDeleteProduct)

router.get('/block-visibility/:id', adminValidate, getBlockVisibility)

router.get('/unblock-visibility/:id', adminValidate, getUnblockVisibility)

// -------------------------------product-details------------------------------------

//--------------------------------order management-------------------------------------

router.get('/order-management', adminValidate, getOrderManagement)

router.post('/change-status', adminValidate, postChangeStatus)

//--------------------------------order management-------------------------------------

//================================category-management-----------------------------------

router.get('/category-management', adminValidate, getCategoryManagement)

router.post('/add-brand', adminValidate,brandUpload.any('image'), postAddBrand)

router.post('/edit-brand/:id', adminValidate,brandUpload.any('image'), postEditBrand)

router.get('/delete-brand/:brandId', adminValidate, getDeleteBrand)

router.post('/add-type', adminValidate, postAddType)

//================================category-management-----------------------------------

//==================================banner-management===================================

router.get('/banner-management', adminValidate, getBannerManagement)

router.post('/add-banner', adminValidate,bannerUpload.array('image'),postAddBanner)

router.post('/edit-banner/:id', adminValidate,bannerUpload.array('image'),postEditBanner)

router.get('/delete-banner/:id', adminValidate, getDeleteBanner)
 
//==================================banner-management===================================

//================================return-management=======================================

router.get('/return-management', adminValidate, getReturnManagement)

 router.post('/return-approved/:returnId/:orderId', adminValidate, postReturnApproved)

//================================return-management=======================================





//================================sales-report=======================================
router.get('/sales-report', adminValidate, getSalesReport)




//================================sales-report=======================================

router.get('/coupon-management', adminValidate, getCouponManagement)


router.post('/coupon-management', adminValidate, postCouponManagement)
  router.get('/removeCoupon', adminValidate, getRemoveCoupon)


//================================Coupons=======================================





//================================Coupons=======================================

// -------------------------------logout------------------------------------

router.get('/logout', getLogout)
// -------------------------------logout------------------------------------




module.exports = router

