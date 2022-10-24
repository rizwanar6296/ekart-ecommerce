const express = require('express');
const router = express.Router();
let adminHelpers = require('../helpers/admin-helpers');
let { productUpload, bannerUpload, brandUpload }=require('../multer')
const categoryHelpers = require('../helpers/category-helpers');
let productHelpers = require('../helpers/product-helpers')
let adminLoggedIn = null
let errMsg = null
let addProductSuccess = null
const fs = require('fs');
const {  } = require('../helpers/category-helpers');
const {  } = require('../helpers/admin-helpers');
const { response } = require('express');


module.exports={
    layout: function (req, res, next) {
        req.app.locals.layout = 'admin-layout'; // set your layout here
        next(); // pass control to the next handler
    },
    getAdminLogin:async function (req, res) {
        await adminHelpers.getAllPaymentCount()
        if (adminLoggedIn) {
            res.redirect('admin/dashboard')
        } else {
            res.render('admin/login', { layout: false, errMsg })
            errMsg = null
        }
    
    },
    postAdminLogin:function (req, res) {
        adminHelpers.doLogin(req.body).then((response) => {
            errMsg = response.errMsg
            if (response.status) {
                adminLoggedIn = req.session.adminLoggedIn = true
                res.redirect('/admin/dashboard')
            } else {
                res.redirect('/admin')
            }
        })
    },
    getAdminDashboard:async function (req, res) {
        let {weeklySalesReport,monthlySalesReport,yearlySalesReport} = await adminHelpers.getTotalReportGraph()
         let paymentCount=await adminHelpers.getAllPaymentCount()
        res.render('admin/dashboard',{weeklySalesReport,monthlySalesReport,yearlySalesReport,paymentCount})
    },
    getUserDetails:function (req, res) {
        adminHelpers.getUserDetails().then((userDetails) => {
            res.render('admin/user-details', { userDetails })
        })
    
    },
    getBlockUser:function (req, res) {
        let { userId } = req.params
        adminHelpers.blockUser(userId).then((data) => {
            res.redirect('/admin/user-details')
        })
    },
    getUnBlockUser:function (req, res) {

        let { userId } = req.params
        adminHelpers.unblockUser(userId).then((data) => {
            res.redirect('/admin/user-details')
        })
    },
    getProductDetails:function (req, res) {
        productHelpers.getAllProductDetails().then((productDetails) => {
            res.render('admin/product-details', { productDetails })
        })
    
    },
    getAddProduct:async function (req, res) {
        let brands = await categoryHelpers.getBrands()
        res.render('admin/add-product', { addProductSuccess, brands })
        addProductSuccess = null
    
    },
    postAddProduct:function (req, res) {

        req.body.stock=parseInt(req.body.stock)
        const productDetails = req.body 
        const files = req.files
        const fileName = files.map((file)=>{
          return file.filename
        })
        productDetails.image = fileName
        productHelpers.addProduct(productDetails).then((data) => {
            res.redirect('/admin/add-product')
            addProductSuccess = 'product added successfully'
        })
    
    },
    getEditProduct:async function (req, res) {
        let productId = req.params.id
        let brands = await categoryHelpers.getBrands()
        productHelpers.getProductDetails(productId).then((productDetails) => {
            res.render('admin/edit-product', { productDetails, brands })
        })
    },
    postEditProduct:async function (req, res) {
        req.body.stock=parseInt(req.body.stock)
        let productId = req.params.id
        let productDetails = req.body
        let oldProductDetails = await productHelpers.getProductDetails(productId)
        if(req.files.length!=0){
        if(oldProductDetails.image){
        let oldImages= oldProductDetails.image
        oldImages.forEach((image) => {
            fs.existsSync('public/images/ekart/products/'+image) && fs.unlinkSync('public/images/ekart/products/'+image)
        });
        }
        const files = req.files
        const fileName = files.map((file)=>{
          return file.filename
        })
        productDetails.image = fileName
        }
        productHelpers.updateProduct(productId, productDetails).then((data) => {
            res.redirect('/admin/product-details')
        })
    
    },
    getDeleteProduct:async function (req, res) {
        let productId = req.params.id
        let oldProductDetails = await productHelpers.getProductDetails(productId)
            
            if(oldProductDetails.image){
            let oldImages=oldProductDetails.image
             oldImages.forEach(image => {
                 fs.existsSync('public/images/ekart/products/'+image) && fs.unlinkSync('public/images/ekart/products/'+image) 
            });
        }
        productHelpers.deleteProduct(productId).then(() => {
            
            res.redirect('/admin//product-details')
        })
    },
    getBlockVisibility:function (req, res) {
        let productId = req.params.id
        productHelpers.blockVisibility(productId).then((data) => {
            res.redirect('/admin//product-details')
        })
    },
    getUnblockVisibility:function (req, res) {
        let productId = req.params.id
        productHelpers.unBlockVisibility(productId).then((data) => {
            res.redirect('/admin//product-details')
        })
    },
    getOrderManagement: function (req, res) {
        adminHelpers.getAllOrders().then((allOrders) => {
            res.render('admin/order-management', { allOrders })
        })
    
    },
    postChangeStatus:function (req, res) {
        let { orderId, orderStatus } = req.body
        adminHelpers.changeStatus(orderId, orderStatus).then(() => {
            res.json({ status: true })
        })
    },
    getCategoryManagement:async function (req, res) {
        let brands=await categoryHelpers.getBrands()
        res.render('admin/category-management',{brands})
    },
    postAddBrand:function (req, res) {
        req.body.image =req.files[0].filename
        categoryHelpers.addBrand(req.body).then((data) => {
            res.redirect('/admin/category-management')
        })  
    },
    postEditBrand:async function (req, res) {
        let id =req.params.id
        let oldImageDetails = await categoryHelpers.getBrand(id)
        req.body.image =(req.files.length!=0) ? req.files[0].filename : oldImageDetails.image   
        let oldBrandDetails = await categoryHelpers.getBrand(id)
        if(req.files.length!=0&&oldBrandDetails.image){
            fs.existsSync('public/images/ekart/category/brands/'+oldBrandDetails.image) && fs.unlinkSync('public/images/ekart/category/brands/'+oldBrandDetails.image)
        }    
        categoryHelpers.editBrand(id,req.body).then((data) => {
            res.redirect('/admin/category-management')
        })  
    },
    getDeleteBrand:function (req, res) {
        let brandId = req.params.brandId
        categoryHelpers.deleteBrand(brandId).then(()=>{
            res.redirect('/admin/category-management')
        })
    },
    postAddType:function (req, res) {
        let type = req.body.type
        categoryHelpers.addType(type).then(() => {
            res.redirect('/admin/category-management')
        })
    },
    getBannerManagement:async function (req, res) {
        let banners= await adminHelpers.getAllBanner()
            res.render('admin/banner-management',{banners})
    },
    postAddBanner:function (req, res) {
        req.body.image = req.files[0].filename
        adminHelpers.addBanner(req.body).then((data)=>{
            res.redirect('/admin/banner-management')
        }) 
    },
    postEditBanner:async function (req, res) {
        let bannerId= req.params.id
        let bannerDetails= await adminHelpers.getBanner(bannerId)
        if(req.files.length!=0){
            const filename = req.files[0].filename
            req.body.image = filename
            if(bannerDetails.image){
            let oldImage= bannerDetails.image
            fs.existsSync('public/images/ekart/banners/'+oldImage) &&  fs.unlinkSync('public/images/ekart/banners/'+oldImage) 
            }
        }
       adminHelpers.editBanner(bannerId,req.body).then(()=>{
        res.redirect('/admin/banner-management')
       })
    },
    getDeleteBanner:async function (req, res) {
        let bannerId= req.params.id
        let bannerDetails= await adminHelpers.getBanner(bannerId)
        adminHelpers.deleteBanner(bannerId).then(()=>{
        if(bannerDetails.image){
            let oldImage= bannerDetails.image
            fs.existsSync('public/images/ekart/banners/'+oldImage) &&  fs.unlinkSync('public/images/ekart/banners/'+oldImage) 
        }
         res.redirect('/admin/banner-management')
        })
     },
     getReturnManagement:async function (req, res) {
        let returnDetals= await adminHelpers.getAllReturnDetails()
        res.render('admin/return-management',{returnDetals})
      },
      postReturnApproved:async function (req, res) {
        if(req.body.status=='return-approved'){
            let {returnId,orderId}=req.params
            await adminHelpers.returnApprovedStatusChange(returnId,orderId)
            res.redirect('/admin/return-management')
        }else{
            res.redirect('/admin/return-management')
        }
      },
      getSalesReport:async function (req, res) {
        let {weeklySalesReport,monthlySalesReport,yearlySalesReport} = await adminHelpers.getTotalReportGraph()
        res.render('admin/sales-report',{weeklySalesReport,monthlySalesReport,yearlySalesReport})
      },
      getCouponManagement:async function (req, res) {
        let coupons = await adminHelpers.getAllCoupons()
        res.render('admin/coupon-management',{coupons,errMsg})
        errMsg=null
      },
      postCouponManagement:function (req, res) {
        const [year, month, day] = req.body.expiryDate.split('-');
        req.body.expiryDate = [month, day, year].join('/');
         adminHelpers.addCoupon(req.body).then((response)=>{
             if(response){
                errMsg= response.errMsg
                res.redirect('/admin/coupon-management')
             }else{
                 res.redirect('/admin/coupon-management')
             }   
            
         })
       },
       getRemoveCoupon:async function (req, res) {
        let couponId= req.query.couponId
        await adminHelpers.removeCoupon(couponId)
        res.json({status:true})
      },
      getLogout:function (req, res) {
        adminLoggedIn = req.session.adminLoggedIn = null
        res.redirect('/admin')
    },
    adminValidate:function(req, res, next) {
        if (adminLoggedIn) {
            next()
        } else (
            res.redirect('/admin')
        )
    }
}