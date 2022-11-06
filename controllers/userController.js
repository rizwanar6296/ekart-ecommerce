require('dotenv').config()
const userHelpers = require('../helpers/user-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const categoryHelpers = require('../helpers/category-helpers')
const productHelpers = require('../helpers/product-helpers');
const SID = process.env.SID
const TOKEN = process.env.TOKEN
const serviceID = process.env.serviceID
const client = require("twilio")(SID, TOKEN);
const paypal = require('paypal-rest-sdk');
const { ObjectID } = require('bson');
const paypalClientId = process.env.paypalClientId
const paypalSecretId = process.env.paypalSecretId

paypal.configure({
  'mode': 'sandbox',
  'client_id': paypalClientId,
  'client_secret': paypalSecretId
})
let errMsg = null
let alreadyUser = null
let successMsg = null
let cartCount = null
let wishlistCount = null
let forgotPassword = null

module.exports = {
  useMiddleware: async function (req, res, next) {
    if (req.session.user) {
      res.locals.userLoggedIn = true
      res.locals.userName = req.session.user.name
      res.locals.cartCount = await userHelpers.getCartCount(req.session.user._id)
      wishlistCount = await userHelpers.wishlistCount(req.session.user._id)
      res.locals.wishlistCount = wishlistCount
      cartCount = res.locals.cartCount
    } else {
      cartCount = null
      res.locals.wishlistCount = null
    }
    req.app.locals.layout = 'user-layout'
    next(); // pass control to the next handler
  },
  getHomePage: async function (req, res, next) {
    // userLoggedIn= req.session.userLoggedIn  
    categoryHelpers.getBrands().then((brands) => {
      productHelpers.getAllProductDetails().then(async (products) => {
        let banners = await adminHelpers.getAllBanner()
        let categories = await categoryHelpers.getCategory()
        let addedToCartItems=null
        let wishlist= null
        let recentlyViewedProducts=null
        let user = (req.session.user)? true:false
        if (user) {
          let userId=req.session.user._id
          wishlist = await userHelpers.getWishlistProducts(userId)
          addedToCartItems =await userHelpers.getCartProductList(userId)
          recentlyViewedProducts = await userHelpers.getRecentlyViewedProducts(userId)
          console.log('recentlyVassssssssssssssssssssssiewedProducts')
          console.log(recentlyViewedProducts)
          console.log('recentlyViesaaaaaaaaaaaaaaaaaaaaaaaaawedProducts')
          if (wishlist) {
            wishlist.forEach(product => {
              product._id = product._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
            });
          }
          res.render('index', { brands, products, banners, wishlist, categories,addedToCartItems ,recentlyViewedProducts,user});
        } else {
          res.render('index', { brands, products, banners,addedToCartItems,recentlyViewedProducts,user });
        }
      })
    });
  },
  postSearch: async (req, res) => {
    let payload = req.body.payload.trim()
    let searchResult = await productHelpers.searchProducts(payload)
    res.send({ payload: searchResult })
  },
  getLogin: function (req, res, next) {
    res.render('user/login', { layout: false, errMsg });
    errMsg = ''
  },
  postLogin: function (req, res, next) {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.errMsg) {
        errMsg = response.errMsg
        res.redirect('/login')
      } else {
        res.locals.userLoggedIn = true
        req.session.userLoggedIn = true
        req.session.user = response.user
       if( req.session.url){
        let url= req.session.url
      req.session.url =null
        console.log('sasasasmachaneennenenenenenenenenenene'+req.session.url+url);
        res.redirect(url)
       }else{
        res.redirect('/')
       }
        console.log( req.session.url);
        console.log('sjdhasgdhjgasjhdgjhasgdjhgasjhdgjhasgdjhgajsdhgjahsgdjhagsjhdgjahsgdh')
       
      }

    })
  },
  getSignup: function (req, res, next) {
    if (alreadyUser) {
      res.render('user/signup', { layout: 'layout', alreadyUser })
      alreadyUser = null
    } else {
      res.render('user/signup', { layout: 'layout' });
    }
  },
  postSignup: function (req, res, next) {

    userHelpers.doSignUp(req.body).then((response) => {
      alreadyUser = response.alreadyUser
      if (alreadyUser) {
        res.redirect('/signup')
      } else {
        res.locals.userLoggedIn = true
        req.session.userLoggedIn = true
        req.session.user = response.user
        res.redirect('/')
      }
    })
  },
  getOtpLogin: function (req, res, next) {
    console.log("req.params.forgotPassword")
    console.log(forgotPassword = (req.query.forgotPassword) ? (req.query.forgotPassword) : null)
    console.log("req.params.forgotPassword")
    res.render('user/otp-login', { layout: false, errMsg });
    errMsg = null
  },
  getSendCode: function (req, res, next) {
    let { number } = req.query
    userHelpers.checkPhoneNumber(number).then((response) => {
      if (response.status) {
        client.verify.services(serviceID).verifications.create({
          to: `+91${number}`,
          channel: 'sms'
        }).then((data) => {
          successMsg = 'Verification is Sent!!'
          res.redirect('/verify/?number=' + number);
        })
      } else {
        errMsg = response.errMsg
        res.redirect('/otp-login');
      }
    })
  },
  getResendCode: function (req, res, next) {
    let { number } = req.query

    userHelpers.checkPhoneNumber(number).then((response) => {
      if (response.status) {
        client.verify.services(serviceID).verifications.create({
          to: `+91${number}`,
          channel: 'sms'
        }).then((data) => {
          successMsg = 'Verification is Sent!!'
          res.redirect('/verify/?number=' + number);
        })
      } else {
        errMsg = response.errMsg
        res.redirect('/otp-login');
      }
    })
  },
  getVerify: function (req, res, next) {
    let phoneNumber = req.query.number
    res.render('user/otp-send-code', { layout: false, successMsg, errMsg, phoneNumber });
    successMsg = null
    errMsg = null
  },
  postVerify: async function (req, res, next) {
    let phoneNumber = req.params.phoneNumber
    let verificationCode = req.body.code
    let user = await userHelpers.getUserWithPhoneNumber(phoneNumber)
    client.verify.services(serviceID).verificationChecks.create({
      to: `+91${phoneNumber}`,
      code: verificationCode,
    }).then((data) => {
      if (data.status === 'approved') {    
        if(forgotPassword){
          res.redirect('/change-forgot-password?phoneNumber=' + phoneNumber)
        }else{
          res.locals.userLoggedIn = true
          req.session.userLoggedIn = true
          req.session.user = user
          res.redirect('/')
        }
      } else {
        errMsg = 'enter valid code'
        res.redirect('/verify/?number=' + phoneNumber)
      }
    })
  },
  getChangeForgotPassword:(req,res)=>{
    let phoneNumber=req.query.phoneNumber
    res.render('user/change-forgot-password',{layout:false,phoneNumber})
  },
  postChangeForgotPassword:async(req,res)=>{
    let phoneNumber = req.params.phoneNumber
    let user = await userHelpers.getUserWithPhoneNumber(phoneNumber)  
    await userHelpers.changePassword(user._id,req.body.password)
    res.locals.userLoggedIn = true
    req.session.userLoggedIn = true
    req.session.user = user
    forgotPassword=null
    res.redirect('/')
  },
  getCart: async function (req, res, next) {
    let userId = req.session.user._id
    // let totalAmount = await userHelpers.getTotalAmount(userId)
    // let productTotal=await userHelpers.getProductTotal(userId)
    let brands = await categoryHelpers.getBrands()
    userHelpers.getCartProducts(userId).then((cartItems) => {
      let totalAmount = cartItems? cartItems.reduce((sum, product) => {
        return parseInt(sum) + parseInt(product.productTotal)
      }, 0):null;
      itemCount = cartCount
      res.render('user/cart', { cartItems, itemCount, totalAmount, brands,cartCount:null })
    })
  },
  getProfile: async function (req, res, next) {
    let userId = req.session.user._id
    let user = await userHelpers.getUserDetails(userId)
    let addressList = await userHelpers.addressList(userId)
    res.render('user/profile', { user, addressList })
  },
  postEditUser: async function (req, res, next) {
    let userId = req.params.id
    await userHelpers.editUserDetails(userId, req.body)
    res.redirect('/profile')
  },
  postCheckPassword: function (req, res, next) {
    let userId = req.session.user._id
    let userPassword = req.body.password
    userHelpers.checkPassword(userId, userPassword).then((response) => {
      res.json(response)
    })
  },
  postChangePassword: function (req, res, next) {
    let userId = req.session.user._id
    let userPassword = req.body.password
    userHelpers.changePassword(userId, userPassword).then((response) => {
      res.redirect('/profile')
    })
  },
  postProfileEditAddress: async function (req, res, next) {
    let userId = req.session.user._id
    let address = req.body
    req.body._id = req.params.id
    userHelpers.editAddress(userId, address).then(() => {
      res.redirect('/profile')
    })

  },
  postProfileAddAddress: async function (req, res, next) {
    let userId = req.session.user._id
    let address = req.body
    userHelpers.addAddress(address, userId).then(() => {
      res.redirect('/profile')
    })

  },
  getProfileDeleteAddress: async function (req, res, next) {
    let userId = req.session.user._id
    let addressId = req.params.id
    userHelpers.deleteAddress(userId, addressId).then(() => {
      res.redirect('/profile')
    })
  },  
  getWallet: async(req, res) => {
    let userId = req.session.user._id
    let walletAmount = await userHelpers.getWalletAmount(userId)
    res.render('user/wallet',{walletAmount})
  },
  getAddToCart: function (req, res, next) {
    console.log("add-to cart req")
    console.log(req.xhr)
    console.log("add-to cart req")
    let userId = req.session.user._id
    let userName = req.session.user.name
    let productId = req.query.productId

    if (!req.session.userLoggedIn) {
      res.json({ status: false })
    } else {
      userHelpers.addToCart(userId, productId, userName).then((response) => {
        if(response.errMsg){
          res.json({ status: false, errMsg: response.errMsg })
        }else{
          res.json({ status: true, cartData: response })
        }
       
      })
    }

  },
  postChangeProductQuantity: async function (req, res, next) {
    let { cartId, productId, count, quantity } = req.body
    if (!req.session.userLoggedIn) {
      response.status = false
      res.json(response)
    } else {
      userHelpers.changePrductQuantity(cartId, productId, count, quantity).then((async (response) => {
        let userId = req.session.user._id
        // let totalAmount = await userHelpers.getTotalAmount(userId)
        // let productTotal=await userHelpers.getProductTotal(userId,productId)
        let cartItems = await userHelpers.getCartProducts(userId)
        let totalAmount = cartItems.reduce((sum, product) => {
          return parseInt(sum) + parseInt(product.productTotal)
        }, 0)
        response.totalAmount = totalAmount
        response.status = true
        res.json(response)
      }))
    }
  },
  postRemoveCartItem: async function (req, res, next) {
    let { cartId, productId } = req.body
    userHelpers.removeCartItem(cartId, productId).then((async (response) => {
      let userId = req.session.user._id
      let totalAmount = await userHelpers.getTotalAmount(userId)
      response.totalAmount = totalAmount
      res.json(response)
    }))
  },
  getAddToWishist: async function (req, res, next) {
    let productId = req.query.productId
    let userId = req.session.user._id
    if (!req.session.userLoggedIn) {
      res.json({ status: false })
    } else {

      userHelpers.addWishlist(userId, productId).then(async () => {
        let wishlistCount = await userHelpers.wishlistCount(userId)
        res.json({ status: true, wishlistCount: wishlistCount })
      })
    }
  },
  getWishlist: async function (req, res, next) {
    let userId = req.session.user._id
    userHelpers.getWishlistProducts(userId).then((wishlistProducts) => {
      res.render('user/wishlist', { wishlistProducts, wishlistCount: null })
    })
  },
  getRemoveWishlist: async function (req, res, next) {
    let productId = req.query.productId
    let userId = req.session.user._id

    userHelpers.removeWishlist(userId, productId).then(async (data) => {
      let wishlistCount = await userHelpers.wishlistCount(userId)
      res.json({ status: true, wishlistCount })
    })

  },
  getPlaceOrder: async function (req, res, next) {


    let userId = req.session.user._id
    let itemCount = cartCount
    let userDetails = await userHelpers.getAddress(userId)
    let cartItems = await userHelpers.getCartProducts(userId)
    let totalAmount = 0
    if (cartItems) {
      totalAmount = cartItems.reduce((sum, product) => {
        return parseInt(sum) + parseInt(product.productTotal)
      }, 0)
    }
    res.render('user/place-order', { totalAmount, itemCount, userId, userDetails })
  },
  getRemoveCoupon: async function (req, res, next) {
    let userId = req.session.user._id
    await userHelpers.removeCoupon(userId)
    res.redirect('/place-order')
  },
  postPlaceOrder: async function (req, res, next) {
    let userId = req.session.user._id
    let cart = await userHelpers.getCartProductList(userId)
    let products = cart ? cart.products : null
    let cartId = cart._id
    let userDetails = await userHelpers.getAddress(userId)
    let cartItems = await userHelpers.getCartProducts(userId)
    let totalAmount = 0
    if (cartItems) {
      totalAmount = cartItems.reduce((sum, product) => {
        return parseInt(sum) + parseInt(product.productTotal)
      }, 0)
    }
    if (userDetails.coupon) {
      totalAmount = parseInt(totalAmount) - ((parseInt(userDetails.coupon.discount) / 100) * parseInt(totalAmount))
    }
    userDetails.userId = userId
    userDetails.payment = req.body.payment
    userHelpers.placeOrder(userDetails, products, totalAmount, cartId).then(async (orderId) => {
      
      if (userDetails.payment === 'COD') {
        await userHelpers.deleteCart(userId, orderId)
        await userHelpers.decrementStock(orderId)
        //await userHelpers.deleteCoupon(userId)
        res.json({ codSuccess: true, orderId })
      } else if (userDetails.payment === 'razorpay') {
        userHelpers.generateRazorpay(orderId, totalAmount).then((response) => {
          res.json(response)
        })
      } else if (userDetails.payment === 'paypal') {
        //  res.redirect('/pay')
        res.json({ status: true, orderId })
      }
    })
  },
  getPay: async (req, res) => {
    let userId = req.session.user._id
    let userDetails = await userHelpers.getAddress(userId)
    let cartItems = await userHelpers.getCartProducts(userId)
    let totalAmount = 0
    if (cartItems) {
      totalAmount = cartItems.reduce((sum, product) => {
        return parseInt(sum) + parseInt(product.productTotal)
      }, 0)
    }
    if (userDetails.coupon) {
      totalAmount = parseInt(totalAmount) - ((parseInt(userDetails.coupon.discount) / 100) * parseInt(totalAmount))
    }
    let orderId = req.query.orderId
    let total = Math.floor(parseInt(totalAmount) * 0.012)
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://localhost:5000/order-summary/?orderId=" + orderId,
        "cancel_url": "http://localhost:5000/place-order"
      },
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": total
        },
      }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {

            res.redirect(payment.links[i].href);
          }
        }
      }
    });

  },
  getOrderSummary: async function (req, res, next) {
    let userId = req.session.user._id
    let orderId = req.query.orderId
    let orderProductDetails = await userHelpers.getOrderSummary(orderId)
    await userHelpers.deleteCoupon(userId)
    let orderDetails = await userHelpers.orderDetails(orderId)
    delete orderDetails.products
    orderDetails.orderProductDetails = orderProductDetails
    if (orderDetails.paymentMethod === 'paypal') {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      let total = Math.floor(parseInt(orderDetails.totalAmount) * 0.012)
      const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
          "amount": {
            "currency": "USD",
            "total": total
          }
        }]
      };

      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          userHelpers.deleteCart(userId).then(async () => {
            await userHelpers.changePaymenStatus(orderId)
            orderDetails.status = (orderDetails.status == 'pending') ? 'placed' : orderDetails.status
            res.render('user/order-summary', { orderDetails })
          })
        }
      });
    }
    else {
      res.render('user/order-summary', { orderDetails })
    }

  },
  postVerifyPayment: (req, res) => {
    let userId = req.session.user._id
    let orderId = req.body['order[receipt]']
    userHelpers.verifyPayment(req.body).then(async () => {
      await userHelpers.deleteCart(userId)
      await userHelpers.changePaymenStatus(orderId)
      await userHelpers.decrementStock(orderId)
      res.json({ status: true, orderId })
    }).catch((error) => {

      res.json({ status: 'payment failed' })
    })
  },
  getChangeAddress: async function (req, res, next) {
    let userId = req.session.user._id
    let addressList = await userHelpers.addressList(userId)

    res.render('user/change-address', { addressList })
  },
  postAddAddress: async function (req, res, next) {
    let userId = req.session.user._id
    let address = req.body
    userHelpers.addAddress(address, userId).then((data) => {
      res.redirect('/change-address')
    })

  },
  postSelectedAddress: async function (req, res, next) {
    let userId = req.session.user._id
    let addressId = req.body.addressId
    userHelpers.updateDefaultAddressId(userId, addressId).then(() => {
      res.redirect('/place-order')
    })
  },
  getCheckCoupon: async function (req, res, next) {
    let couponCode = req.query.couponCode
    let userId = req.session.user._id
    userHelpers.applyCoupon(couponCode, userId).then((response) => {
      res.json(response)
    })
  },
  getOrders: function (req, res, next) {
    let userId = req.session.user._id
    userHelpers.ordersList(userId).then((orderList) => {
      res.render('user/orders', { orderList })
    })
  },
  getCancelOrder: function (req, res, next) {
    let orderId = req.query.orderId
    userHelpers.cancelOrder(orderId).then((response) => {
      userHelpers.incrementStock(orderId).then(() => {
        res.json(response)
      })

    })
  },
  postReturnOrderRequest: function (req, res, next) {
    let orderId = req.query.orderId
    let userId = req.session.user._id
    req.body.orderId = orderId
    req.body.userId = userId

    let returnReason = req.body
    userHelpers.returnRequest(orderId, returnReason).then((response) => {
      res.json(response)
    })
  },
  getProductList: async function (req, res) {
    let products = res.paginatedResults.products
    let next = res.paginatedResults.next
    let previous = res.paginatedResults.previous
    let pages = res.paginatedResults.pages
    let pageCount = res.paginatedResults.pageCount
    let currentPage = res.paginatedResults.currentPage
    let limit = res.paginatedResults.limit
    let startIndex = res.paginatedResults.startIndex
    let brands = await categoryHelpers.getBrands()
    let brandFilter = null
    let addedToCartItems=null
    let wishlist= null
    if (req.query.brandFilter) {
      brandFilter = (Array.isArray(req.query.brandFilter)) ? req.query.brandFilter : Object.values(req.query)
      products = await productHelpers.getBrandWiseResult(brandFilter)
      // brandFilter=brandFilter.map((brand)=>{
      //   return brand.toString()
      // })
    }
    if (req.session.user) {
      let userId=req.session.user._id
      wishlist = await userHelpers.getWishlistProducts(userId)
      addedToCartItems =await userHelpers.getCartProductList(userId)
      if (wishlist) {
        wishlist.forEach(product => {
          product._id = product._id.toString().replace(/ObjectId\("(.*)"\)/, "$1")
        });
      }
    }
    res.render('user/product-list', { products, cartCount, next, previous, pageCount, currentPage, pages, brands, brandFilter,wishlist,addedToCartItems });
  },
  getProductListCategory: async function (req, res, next) {
    let brandId = req.params.brandId
    let brands = await categoryHelpers.getBrands()
    let products = await productHelpers.brandWiseProducts(brandId)
    res.render('user/product-list', { products, brands })
  },
  getProductDetails: async function (req, res, next) {
    let productId = req.query.productId
    let brands = await categoryHelpers.getBrands()
    if(req.session.user){
    let userId= req.session.user._id
    await userHelpers.addRecentlyViewedProducts(userId,productId)
    }
    productHelpers.getProductDetails(productId).then((productDetails) => {
      res.render('user/product-details', { productDetails, cartCount, brands })
    })
  },
  getLogout: function (req, res, next) {
    req.session.user = null
    req.session.userLoggedIn = null
    res.locals.userLoggedIn = null
    cartCount = null
    res.redirect('/')
  },
  userProductListPageination: async (req, res, next) => {
    const page = parseInt(req.query.page)
    // const limit = parseInt(req.query.limit)
    const limit = 3
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}
    let productsCount = await productHelpers.getProductsCount()

    if (endIndex < productsCount) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.products = await productHelpers.getPaginatedResult(limit, startIndex)
      results.pageCount = Math.ceil(parseInt(productsCount) / parseInt(limit)).toString()
      results.pages = Array.from({ length: results.pageCount }, (_, i) => i + 1)
      results.currentPage = page.toString()
      results.limit = limit
      results.startIndex = startIndex
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }

  }

}