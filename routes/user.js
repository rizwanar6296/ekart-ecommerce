

const express = require('express');
const router = express.Router();

// const client = require("twilio")(SID, TOKEN);
// const paypal = require('paypal-rest-sdk');

const { userValidate, userVerifyLogin,urlHistory, } = require('../controllers/middleware');
const { useMiddleware, getHomePage, getLogin, postLogin, getSignup, postSignup, getOtpLogin, getSendCode, getResendCode, getVerify, postVerify, getCart, getProfile, postEditUser, postCheckPassword, postChangePassword, postProfileEditAddress, postProfileAddAddress, getProfileDeleteAddress, getAddToCart, postChangeProductQuantity, postRemoveCartItem, getAddToWishist, getWishlist, getRemoveWishlist, getPlaceOrder, getRemoveCoupon, postPlaceOrder, getPay, getOrderSummary, postVerifyPayment, getChangeAddress, postAddAddress, postSelectedAddress, getCheckCoupon, getOrders, getCancelOrder, postReturnOrderRequest, getProductList, getProductListCategory, getProductDetails, getLogout, userProductListPageination, postSearch, getWallet, getChangeForgotPassword, postChangeForgotPassword } = require('../controllers/userController');


router.use('/', useMiddleware);

/* GET home page. */
router.get('/',urlHistory, getHomePage)
router.post('/search',postSearch)

router.get('/login', userValidate,getLogin);
router.post('/login', postLogin);

router.get('/signup', userValidate, getSignup);

router.post('/signup', postSignup);

//---------------------------OTP-------------------------------------
router.get('/otp-login', userValidate, getOtpLogin);
router.get('/send-code', userValidate, getSendCode);
router.get('/resend-code', userValidate, getResendCode);
router.get('/verify', userValidate, getVerify);
router.post('/verify/:phoneNumber', userValidate,postVerify);
router.get('/change-forgot-password',userValidate,getChangeForgotPassword)
router.post('/change-forgot-password/:phoneNumber',userValidate,postChangeForgotPassword)

//---------------------------OTP-------------------------------------

//===============cart===================
router.get('/cart',urlHistory, userVerifyLogin, getCart);



// =========================profile=================================


router.get('/profile', urlHistory,userVerifyLogin, getProfile);
router.post('/edit-user/:id', userVerifyLogin, postEditUser);
router.post('/check-password', userVerifyLogin, postCheckPassword);
router.post('/change-password', userVerifyLogin, postChangePassword);
router.post("/profile-edit-address/:id", userVerifyLogin, postProfileEditAddress);
router.post("/profile-add-address", userVerifyLogin, postProfileAddAddress);
router.get("/profile-delete-address/:id", userVerifyLogin, getProfileDeleteAddress);
router.get('/wallet',urlHistory,userVerifyLogin,getWallet)


// =========================profile=================================

router.get('/add-to-cart', userVerifyLogin, getAddToCart);


router.post('/change-product-quantity', userVerifyLogin, postChangeProductQuantity);

router.post('/remove-cart-item', userVerifyLogin, postRemoveCartItem);
//===============cart===================
//=================wishlist============================
router.get('/add-to-wishlist', userVerifyLogin, getAddToWishist);
router.get('/wishlist',urlHistory, userVerifyLogin, getWishlist);
router.get('/remove-wishlist', userVerifyLogin, getRemoveWishlist);
//=================wishlist============================

// =================place-order=========================
router.get('/place-order', userVerifyLogin, getPlaceOrder);
router.get('/remove-coupon', userVerifyLogin, getRemoveCoupon);

//paypal======================================
router.post('/place-order', userVerifyLogin, postPlaceOrder);

router.get('/pay', getPay);


//=====================order-summary=========================

router.get('/order-summary', userVerifyLogin, getOrderSummary);

//=====================order-summary=========================


// paypal-------------------------------------------------------------------


router.post('/verify-payment', postVerifyPayment)



router.get('/change-address', userVerifyLogin, getChangeAddress);

router.post('/add-address', userVerifyLogin, postAddAddress);
router.post('/selected-address', userVerifyLogin, postSelectedAddress);
router.get('/check-coupon', userVerifyLogin, getCheckCoupon);

// =================place-order=========================  

//=========================orders====================================
router.get('/orders',urlHistory, userVerifyLogin, getOrders);
router.get('/cancel-order', userVerifyLogin, getCancelOrder);
router.post('/return-order-request', userVerifyLogin, postReturnOrderRequest);


router.get('/product-list',urlHistory,userProductListPageination, getProductList);




router.get('/productlist-category/:brandId',getProductListCategory);


router.get('/product-details',urlHistory,getProductDetails);

router.get('/logout', getLogout);





module.exports = router;
