const db = require('../config/connections')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay')
const { response } = require('express')
const instance = new Razorpay({ key_id: 'rzp_test_ZKoiMsSjoOkObn', key_secret: 'SflK6TBS6CPwtI8ZMit2xL3z' })
const ObjectId = require('mongodb').ObjectId

module.exports = {
    doSignUp: (userData) => {
        return new Promise((resolve, reject) => {
            let response = {}
            // userData.status=true        
            db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email }).then(async (data) => {
                if (data) {
                    response.alreadyUser = 'already same user with email id'
                    resolve(response)
                } else {
                    userData.status = true
                    userData.wallet= 0;
                    userData.password = await bcrypt.hash(userData.password, 10)
                    db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                        userData._id = data.insertedId
                        response.user = userData
                        response.status = true
                        resolve(response)
                    })
                }
            })
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            if (user) {
                if (user.status) {
                    bcrypt.compare(userData.password, user.password).then((data) => {
                        if (data) {
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            response.errMsg = 'wrong Password'
                            response.status = false
                            resolve(response)
                        }
                    })
                } else {
                    response.errMsg = "user is blocked"
                    resolve(response)
                }

            } else {
                response.errMsg = 'email doesnot exist'
                response.status = false
                resolve(response)
            }
        })
    },
    getUserDetails:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)}).then((user)=>{
                resolve(user)
            })
        })
    },
    editUserDetails:(userId,userDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:userDetails}).then((data)=>{
               
                resolve()
            })
        })
    },
    checkPassword:(userId,userPassword)=>{
        return new Promise((resolve, reject) => {
            let response={}
            db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)}).then((user)=>{
                bcrypt.compare(userPassword,user.password ).then((data) => {
                   
                    if (data) {
                        response.status = true
                        resolve(response)
                    } else {
                        response.errMsg = 'wrong Password'
                        response.status = false
                        resolve(response)
                    }
                })
            })
        })
    },
    changePassword:(userId,password)=>{
        console.log('userId,password')
        console.log(userId,password)
        console.log('userId,password')
        return new Promise(async(resolve, reject) => {
            password = await bcrypt.hash(password, 10)
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{password:password}}).then((data)=>{
                console.log('userId,password datadatadatadatadatadata')
                console.log(data)
                console.log('userId,passworddatadatadatadatadatadatadata')
                resolve()
            })
        })
    },
    checkPhoneNumber: (phoneNumber) => {
        return new Promise((resolve, reject) => {
            let response = {}
            db.get().collection(collection.USER_COLLECTION).findOne({ number: phoneNumber }).then((data) => {
                if (data.status) {
                    if (data) {
                        response.user = data
                        response.status = true
                        resolve(response)
                    } else {
                        response.status = false
                        response.errMsg = 'user with the no is not registered'
                        resolve(response)
                    }
                } else {
                    response.status = false
                    response.errMsg = 'user is blocked'
                    resolve(response)
                }

            })
        })
    },
    getUserWithPhoneNumber:(number)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({number:number}).then((user)=>{
                resolve(user)
            })
        })
    },
    
    addToCart: (userId, productId, userName) => {
        let prodObj = {
            item: ObjectId(productId),
            quantity: 1
        }
        return new Promise(async(resolve, reject) => {
            let product= await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({_id:ObjectId(productId)})
            let category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(product.brand)})
            let discount = (parseInt(product.discount)>parseInt(category.discount))?parseInt(product.discount):parseInt(category.discount)
            prodObj.discount=discount
            db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) }).then((userCart) => {
        
                    if (userCart) {
                        let prodExist = userCart.products.findIndex(element => element.item == productId)
                     
                        if (prodExist != -1) {
                            console.log('prodExist')
                            console.log(product.stock>userCart.products[prodExist].quantity)
                            console.log('prodExist')
                            if(product.stock>userCart.products[prodExist].quantity){
                                db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'products.item': ObjectId(productId) }, { $inc: { "products.$.quantity": 1 } }).then((data) => {
                                    data.ajaxCount = false
                                    resolve(data)
                                })
                            }else{
                                resolve({errMsg:'out of stock'})
                            }
                        } else {
                            db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) }, { $push: { products: prodObj } }).then((data) => {
                                data.ajaxCount = true
                                resolve(data)
                            })
                        }
                    } else {
                        let cartObj = {
                            user: ObjectId(userId),
                            products: [prodObj],
                            userName: userName
                        }
                        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((data) => {
                            data.ajaxCount = true
                            resolve(data)
                        })
                    }
                
            })
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let ifCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (ifCart) {
                db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    }, {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity',
                            discount:'$products.discount'
                        }
                    }, {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1,discount:{$toInt:'$discount'} ,product: { $arrayElemAt: ['$product', 0] }
                        }
                    }, 
                    {
                        $addFields: {
                            convertedPrice: { $toInt: "$product.price" },
                        }
                    }, {
                        $project: {
                            item: 1, quantity: 1, product: 1,discount:1, productTotal:{$subtract:[{ $multiply: ['$quantity', '$convertedPrice']},{$multiply: [{$multiply:['$quantity','$convertedPrice']}, {$divide:['$discount',100]}]}]} 
                        }
                    },


                ]).toArray().then((cartList) => {
                    resolve(cartList)
                })
            } else {
                resolve(ifCart)
            }


        })
    },
    getCartCount: (userId, productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) }).then((cart) => {
                let count = 0
                if (cart) {
                    count = cart.products.length

                    resolve(count)
                } else {
                    resolve(count)
                }

            })
        })
    },

    wishlistCount: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId)}).then((user) => {
                let wishlistCount = 0
              
                if (user.wishlist) {
                    wishlistCount = user.wishlist.length
                    resolve(wishlistCount)
                } else {
                    resolve(wishlistCount)
                }

            })
        })
    },
    changePrductQuantity: (cartId, productId, count,quantity) => {
        count = parseInt(count)
        let response={}
        return new Promise(async(resolve, reject) => {
            if(count==1){
                let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({_id:ObjectId(productId)})
                if(quantity>=parseInt(product.stock)){
                    response.outOfStockError='Out of Stock'
                    resolve(response)
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId), 'products.item': ObjectId(productId) }, { $inc: { "products.$.quantity": count } }).then((data) => {
                        response.outOfStockError=false
                        resolve(response)
                    })
                }
            }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId), 'products.item': ObjectId(productId) }, { $inc: { "products.$.quantity": count } }).then((data) => {
                    response.outOfStockError=false
                    resolve(response)
                })
            }
           
        })
    },
    removeCartItem: (cartId, productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) }, { $pull: { 'products': { item: ObjectId(productId) } } }).then((data) => {

                resolve(data)
            })
        })
    },
    // getProductTotal:(userId,productId)=>{
    //     return new Promise(async(resolve, reject) => {
    //         db.get().collection(collection.CART_COLLECTION).aggregate([{
    //             $match:{user:ObjectId(userId)},                
    //         },{
    //             $unwind:'$products'
    //         },{
    //             $project:{
    //                 item:'$products.item',
    //                 quantity:'$products.quantity'
    //             }
    //         },{
    //             $lookup:{
    //                 from:collection.PRODUCTS_COLLECTION,
    //                 localField:'item',
    //                 foreignField:'_id',
    //                 as:'product'
    //             }
    //         },{
    //             $project:{
    //                 item:1,quantity:1,price:{$toInt:{$arrayElemAt:['$product.price',0]}}
    //             }
    //         },{
    //             $group:{
    //                 _id:ObjectId(productId),
    //                 total:{$multiply:['$quantity','$price']}
    //             }
    //         }]).toArray().then((productTotal)=>{              
    //            
    //             resolve(productTotal)                        
    //         })  
    //     })
    // }, 
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let ifCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId), 'products.item': { $exists: true } })

            if (ifCart) {
                db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) },
                    }, {
                        $unwind: '$products'
                    }, {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }, {
                        $project: {
                            item: 1, quantity: 1, price: { $toInt: { $arrayElemAt: ['$product.price', 0] } }
                        }
                    }, {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$price'] } }
                        }
                    }
                ]).toArray().then(async (data) => {
                    resolve(data[0].total)
                })
            } else {
                resolve(ifCart)
            }

        })
    },
    placeOrder: (userDetails, products, totalAmount,cartId) => {
        let status = userDetails.payment === 'COD' ? 'placed' : 'pending'
        let coupon=userDetails.coupon?userDetails.coupon : null
      
        let date = new Date()
        
        obj = {
            date: date.toLocaleDateString('en-US'),
            cartId:cartId, 
            firstName: userDetails.address.firstName,
            lastName: userDetails.address.lastName,
            email: userDetails.address.email,
            address: {
                houseName: userDetails.address.houseName,
                streetAdress: userDetails.address.streetAdress,
                city: userDetails.address.city,
                state: userDetails.address.state,
                pincode: userDetails.address.pincode
            },
            phoneNumber: userDetails.address.phoneNumber,
            userId: userDetails.userId,
            paymentMethod: userDetails.payment,
            products: products,
            totalAmount: totalAmount,
            status: status,
            coupon:coupon
        }
        return new Promise(async (resolve, reject) => {
            let ifSameOrder=await db.get().collection(collection.ORDER_COLLECTION).findOne({cartId:cartId})
            if(ifSameOrder){
                db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate({cartId:cartId},{$set:obj},{$upsert:true}).then((data) => {
                 
                    resolve(data.value._id)
                })
            }else{
                db.get().collection(collection.ORDER_COLLECTION).insertOne(obj).then((data) => {
                    resolve(data.insertedId)
                })
            }
            
        })
    },
    deleteCart:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId)}).then(()=>{
                resolve()
            })
        })
    },
    decrementStock:(orderId)=>{
        return new Promise(async(resolve, reject) => {
            let products= await db.get().collection(collection.ORDER_COLLECTION).aggregate([ { $match:{_id:ObjectId(orderId)} },{ $unwind:'$products' },{ $project:{item:"$products.item",quantity:"$products.quantity"} } ]).toArray()
            await products.forEach(product => {
              db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:product.item}, { $inc:{stock:-product.quantity} })
            });  
            resolve() 
        })
     
    },
    incrementStock:(orderId)=>{
        return new Promise(async(resolve, reject) => {
            let products= await db.get().collection(collection.ORDER_COLLECTION).aggregate([ { $match:{_id:ObjectId(orderId)} },{ $unwind:'$products' },{ $project:{item:"$products.item",quantity:"$products.quantity"} } ]).toArray()
            await products.forEach(product => {
              db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:product.item}, { $inc:{stock:product.quantity} })
            });  
            resolve() 
        })
     
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            resolve(cart)
        })
    },
    addRecentlyViewedProducts:(userId,productId)=>{
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$addToSet:{recentlyViewed:ObjectId(productId)}},{$upsert:true})
            resolve()
        })
    },
    getRecentlyViewedProducts:(userId)=>{
        return new Promise(async(resolve, reject) => {
           let recentlyViewedProducts=await db.get().collection(collection.USER_COLLECTION).aggregate([{
                $match:{
                    _id:ObjectId(userId)
                }
            },{
                $project:{recentlyViewed:1}
            },
            {
                $lookup:{
                    from:collection.PRODUCTS_COLLECTION,
                    localField:'recentlyViewed',
                    foreignField:'_id',
                    as:'products'
                }
            },{
                $project:{products:1,_id:0}
            }
        ]).toArray()
        resolve(recentlyViewedProducts[0])
        })
    },
    getOrderSummary: (cartId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(cartId) }
                },
                {
                    $project: { products: 1 }
                }, {
                    $unwind: '$products'
                }, {
                    $project: { productId: '$products.item', quantity: '$products.quantity',discount:'$products.discount'}
                },{
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $unwind: '$product'
                },
                {
                    $addFields:{
                        productTotal:{$subtract:[{ $multiply: ['$quantity', {$toInt:'$product.price'}]},{$multiply:[{$multiply:['$quantity',{$toInt:'$product.price'}]},{$divide:['$discount',100]}]}]
                    }
                }
            }
               
             //   {$subtract:[{ $multiply: ['$quantity', {$toInt:'$product.price'}]},{$multiply: [{$multiply:['$quantity','$convertedPrice']}, {$divide:['$discount',100]}]}]} 
            ]).toArray().then((orderSummary) => {
                resolve(orderSummary)
            })
        })
    },
    orderDetails: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) }).then((data => {
                resolve(data)
            }))
        })
    },
     ordersList: (userId) => {
       
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $match: { userId: userId }
            }, {
                $project: { products: 1 }
            },
            {
                $unwind: '$products'
            }, {
                $project: { productId: '$products.item', quantity: '$products.quantity',discount:'$products.discount' }
            },
            {
                $lookup: {
                    from: collection.PRODUCTS_COLLECTION,
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $unwind: '$products'
            },
            {
                $group: { _id: "$_id", productList: { $push: { product: '$products', quantity: "$quantity",discount:'$discount' } } }
            },
            {
                $lookup: {
                    from: collection.ORDER_COLLECTION,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'orderDetails'
                }
            }, {
                $unwind: '$orderDetails'
            }, {
                $sort: { _id: -1 }
            }
            ]).toArray().then((orders) => {
                console.log('ordsdddddddddddddddders')
                console.log(orders[0].productList[0])
                console.log('ordssssssssssssssssders')
                resolve(orders)
            })
        })

    },
    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, { $set: { status: 'cancelled' } }).then((data) => {
                resolve(data)
            })
        })
    },
    returnRequest:(orderId,returnDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{$set:{status:'retrun-request'}}).then(async(response)=>{
                await db.get().collection(collection.RETURN_COLLECTION).insertOne(returnDetails)
              
                resolve(response)
            })
        })
    },
    addAddress: async (address, userId) => {
        let defaultAddressId = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId), defaultAddressId: { $exists: true } })
        address._id = Date.now().toString()

        if (defaultAddressId) {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $addToSet: { address: address } }, { $upsert: true }).then((data) => {
                    resolve(data)
                })
            })
        } else {
            return new Promise((resolve, reject) => {
                let defaultAddressId = address._id
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $addToSet: { address: address }, $set: { defaultAddressId: defaultAddressId } }, { $upsert: true }).then((data) => {
                    resolve(data)
                })
            })
        }

    },
    editAddress:(userId,address)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId),'address._id':address._id},{$set:{'address.$':address}},).then(()=>{
                resolve()
            })
        })
    },
    deleteAddress:(userId,addressId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId),'address._id':addressId},{$pull:{'address':{'_id':addressId}}}).then(()=>{
                resolve()
            })
        })
    },
    addressList: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then((addressList) => {
                resolve(addressList.address)
            })
        })
    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            let defaultAddressId = user.defaultAddressId
            db.get().collection(collection.USER_COLLECTION).aggregate([{
                $match: { _id: ObjectId(userId) }
            }, {
                $unwind: '$address'
            },
            {
                $match: { 'address._id': defaultAddressId }
            },
            ]).toArray().then((address) => {
                resolve(address[0])
            })
        })
    },
    updateDefaultAddressId: (userId, selectedAddressId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { defaultAddressId: selectedAddressId } }).then((data) => {
                resolve(data)
            })
        })
    },
    addWishlist: (userId, prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $addToSet: { wishlist: ObjectId(prodId) } }, { $upsert: true }).then((data) => {
                resolve()
            })
        })
    },
    getWishlistProducts: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(userId) }
                }, {
                    $project: { wishlist: 1 }
                }, {
                    $unwind: '$wishlist'
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'wishlist',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $unwind: '$product'
                },
                {
                    $group: { _id: '$_id', products: { $push: '$product' } }
                }

            ]).toArray().then((wishlist) => {
                if (wishlist[0]) {
                    resolve(wishlist[0].products)
                } else {
                    resolve(null)
                }

            })
        })
    },
    removeWishlist: (userId, prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId), wishlist: { $exists: true } }, { $pull: { wishlist: ObjectId(prodId) } }).then((data) => {
                resolve()
            })
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            let options = {
                amount: total*100,
                currency: "INR",
                receipt:orderId.toString(),
            };
            instance.orders.create(options, (err, order) => {
                if(err){
                   
                }else{
                
                    resolve(order)
                }
               
            })  
        })
    },
    verifyPayment:(details)=>{
 
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'SflK6TBS6CPwtI8ZMit2xL3z')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac =hmac.digest('hex');
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymenStatus:(orderId)=>{
       console.log('orderId')
       console.log(orderId)
       console.log('orderId')
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{$set:{status:'placed'}})
                resolve({status:true})
        
        })
    },
    applyCoupon:(couponCode,userId)=>{
        return new Promise(async(resolve, reject) => {  
            let response={}
            let coupon= await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:couponCode})
            let alreadyAppliedCoupon=await db.get().collection(collection.ALREADY_APPLIED_COUPON_COLLECTION).findOne({'couponDetails.coupon.couponCode':couponCode})
            let date = new Date().toLocaleDateString('en-US')
            if(coupon){
                if(alreadyAppliedCoupon){
                    response.errMsg='Coupon Already Applied'
                    resolve(response)
                }else{
                    if(coupon.expiryDate>date){
                        await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{coupon:coupon}})
                        response.status=true
                        resolve(response)
                    }else{
                        response.errMsg='Coupon Expired'
                        resolve(response)
                    }
                }
               
            }else{
                response.errMsg='Invalid Coupon Code'
                resolve(response)
            }
        })
    },
    deleteCoupon:(userId)=>{
        return new Promise(async(resolve, reject) => {
            let couponDetails= await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)},{coupon:1})
            if(couponDetails){
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$unset:{coupon:1}})
            await db.get().collection(collection.ALREADY_APPLIED_COUPON_COLLECTION).insertOne({userId:userId,couponDetails:couponDetails})
      
            resolve()
            }else{
            resolve()
            }
        })
       
    },
    removeCoupon:(userId)=>{
        return new Promise(async(resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$unset:{coupon:1}})
            resolve()
        })
    },
    getWalletAmount:(userId)=>{
        return new Promise(async(resolve, reject) => {
       let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
            resolve(user.wallet)
        })
    }
 
}