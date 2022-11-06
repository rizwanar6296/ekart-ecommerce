const db = require('../config/connections')
const collection = require('../config/collections')
const { response } = require('express')
const { resolve } = require('path')
const objectId=require('mongodb').ObjectId

module.exports={
    doLogin:(adminData)=>{
        return new Promise((resolve, reject) => {
        let response={}
        db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email}).then((data)=>{
            if(data){
                if(data.password===adminData.password){
                    response.status=true
                    response.email=data.email
                    resolve(response)
                }else{
                    response.status=false
                    response.errMsg='password is invalid'
                    resolve(response)
                }
            }else{
                response.errMsg='email is invalid'
                response.status=false
                resolve(response)
            }
        })
            
        })
        
    },
    getUserDetails:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).find().toArray().then((userDetails)=>{
                resolve(userDetails)
            })
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{status:false}},{upsert:true}).then((data)=>{
                resolve(data)
            })
        })
    },
    unblockUser:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{status:true}},{upsert:true}).then((data)=>{
                resolve(data)
            })
        })
    },
    getAllOrders:()=>{
        console.log()
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $match:{userId:{$exists:true}}
            },{
                $project:{products:1}
            },
            {
                $unwind:'$products'
            },{
                $project:{productId:'$products.item',quantity:'$products.quantity'}
            },
           {
            $lookup:{
                    from:collection.PRODUCTS_COLLECTION,
                    localField:'productId',
                    foreignField:'_id',
                    as:'products'
                }
            },{
                $unwind:'$products'
            },{
                $group:{_id:"$_id",productList:{$push:{product:'$products',quantity:"$quantity"}}}
            },{
                $lookup:{
                    from:collection.ORDER_COLLECTION,
                    localField:'_id',
                    foreignField:'_id',
                    as:'orderDetails'
                }
            },{
                $unwind:'$orderDetails'
            },{
                $sort:{_id:-1}
            }
        ]).toArray().then((orders)=>{
                console.log('=this is it------------------------------')
                console.log(orders)
                console.log('=this is it------------------------------')
                resolve(orders)
            })
        })

        },
        changeStatus:(orderId,orderStatus)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:orderStatus}}).then(()=>{
                    resolve()
                })
            })
        },
        addBanner:(bannerDetails)=>{
            return new Promise((resolve, reject) => {
                let date = new Date()
                bannerDetails.date=date.toLocaleDateString()
                db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerDetails).then((data)=>{
                    resolve(data)
                })
            })
        },
        getAllBanner:()=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.BANNER_COLLECTION).find().toArray().then((banners)=>{
                    resolve(banners)
                })
            })
        },
        editBanner:(bannerId,bannerDetails)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},{$set:bannerDetails},{$upsert:true}).then(()=>{
                    resolve()
                })
            })
        },
        deleteBanner:(bannerId,bannerDetails)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(bannerId)}).then(()=>{
                    resolve()
                })
            })
        },
        getBanner:(bannerId)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerId)}).then((bannerDetails)=>{
                    resolve(bannerDetails)
                })
            })
        },
        getTotalReportGraph:()=>{
            return new Promise(async(resolve,reject)=>{
                let weeklySalesReport = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        status:{
                            $nin:['cancelled']
                        }
                    }
                },
                {
                    $group: {
                        _id:  "$date",
                        totalSaleAmount: { $sum: "$totalAmount" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
            ]).toArray()
            console.log('weeklySalesReport')
            console.log(weeklySalesReport)
            console.log('weeklySalesReport')
            let monthlySalesReport= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    status:{
                        $nin:['cancelled']
                    }
                }
            },
            {
                $project:{
                    isoDate:{$dateFromString:{dateString:"$date"}},
                    totalAmount:1
                }
            },
            {
                $group: {
                    _id:{ $dateToString: { format: "%Y-%m", date: "$isoDate"} },
                    totalSaleAmount: { $sum: "$totalAmount" },
                    count:{$sum:1}
                }
            },
            {
                $sort:{_id:1}
            }
           
        ]).toArray()
        console.log('monthlySalesReport')
            console.log(monthlySalesReport)
            console.log('monthlySalesReport')

        let yearlySalesReport= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match:{
                status:{
                    $nin:['cancelled']
                }
            }
        },
        {
            $project:{
                isoDate:{$dateFromString:{dateString:"$date"}},
                totalAmount:1
            }
        },
        {
            $group: {
                _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                totalSaleAmount: { $sum: "$totalAmount" },
                count:{$sum:1}
            }
        }, {
            $sort:{_id:1}
        }
        ]).toArray()
        resolve({weeklySalesReport,monthlySalesReport,yearlySalesReport})
            })
        },
        getAllReturnDetails:()=>{
            return new Promise(async(resolve, reject) => {
              let allReturnDetails=  await db.get().collection(collection.RETURN_COLLECTION).aggregate([{
                    $project:{
                        _id:0,
                        userId:{ $toObjectId: "$userId" } ,
                        returnId:'$_id',
                        orderId:{ $toObjectId: "$orderId" }  
                    }
                },{
                    $lookup:{
                        from:collection.ORDER_COLLECTION,
                        localField:'orderId',
                        foreignField:'_id',
                        as:'order'
                    }
                },{
                    $project:{
                        returnId:1,
                        userId:1,
                        orderId:1,
                        products:'$order.products'
                    }
                },
                {
                    $unwind: '$products'
                }, 
                {
                    $unwind:'$products'
                },
                {
                    $project: {returnId:1,orderId:1,userId:1, productId: '$products.item', quantity: '$products.quantity' }
                },{
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'products'
                    }
                }, {
                    $unwind: '$products'
                }, {
                    $group: { _id: {returnId:'$returnId',orderId:'$orderId',userId:'$userId'}, productList: { $push: { product: '$products', quantity: "$quantity" } } }
                },{
                    $lookup: {
                        from: collection.ORDER_COLLECTION,
                        localField: '_id.orderId',
                        foreignField: '_id',
                        as: 'order'
                    }
                },{
                    $lookup: {
                        from: collection.RETURN_COLLECTION,
                        localField: '_id.returnId',
                        foreignField: '_id',
                        as: 'return'
                    }
                },{
                    $unwind:'$order'
                },
                {
                    $unwind:'$return'
                }
                
                
            ]).toArray()
           
            resolve(allReturnDetails)
            })
        },
        returnApprovedStatusChange:(returnId,orderId)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:'return-approved'}}).then(async(data)=>{
                    await db.get().collection(collection.RETURN_COLLECTION).updateOne({_id:objectId(returnId)},{$set:{status:'return-approved'}})
                    console.log('data')
                    console.log(data)
                    console.log('data')
                    resolve()
                })
              
            })
        },
        addCoupon:(couponDetails)=>{
            let response={}
            return new Promise(async (resolve, reject) => {
               let couponExist =await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:couponDetails.couponCode})
               console.log('couponExist')
               console.log(couponExist)
               console.log('couponExist')
               if(couponExist){
                response.errMsg='coupon already exists'
                resolve(response)
               }else{
                await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails)
                resolve()
               }
              
            })
        },
        getAllCoupons:()=>{
            return new Promise(async (resolve, reject) => {
                await db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((data)=>{
                    console.log('data')
                    console.log(data)
                    console.log('data')
                    resolve(data)
                })
            })
        },
        removeCoupon:(couponId)=>{
            return new Promise(async(resolve, reject) => {
                await db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)})
                resolve()
            })
        },
        getAllPaymentCount:()=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                    $facet:{
                        COD: [
                            { $match : { "paymentMethod":'COD' }},
                            { $count: "COD"},
                          ],
                          paypal: [
                            { $match : { "paymentMethod":'paypal' }},
                            { $count: "paypal"},
                          ],
                          razorpay: [
                            { $match : { "paymentMethod":'razorpay' }},
                            { $count: "razorpay"},
                          ],
                    }
                },{ $project: {
                    CODCount: {$arrayElemAt: ["$COD.COD", 0] },
                    paypalCount: {$arrayElemAt: ["$paypal.paypal", 0] },
                    razorpayCount: {$arrayElemAt: ["$razorpay.razorpay", 0] }
                  }}
            ]).toArray().then((data)=>{
               resolve(data[0])
                
            })
            })
        },
        getDailyCodSales:()=>{
            return new Promise(async(resolve, reject) => {
                let COD= await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                 $match : { "paymentMethod":'COD' }},
                { $group:{_id:{day:{$dayOfMonth:'$_id'}},totalAmount:{$sum:'$totalAmount'},count:{$sum:1}} },
                { $sort : {"_id.day" : 1} }             
                    ]).toArray()
                let paypal =await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                    $match : { "paymentMethod":'paypal' }},
                   { $group:{_id:{day:{$dayOfMonth:'$_id'}},totalAmount:{$sum:'$totalAmount'},count:{$sum:1}} },
                   { $sort : {"_id.day" : 1} }             
                       ]).toArray()
                let razorpay =await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                $match : { "paymentMethod":'razorpay' }},
                { $group:{_id:{day:{$dayOfMonth:'$_id'}},totalAmount:{$sum:'$totalAmount'},count:{$sum:1}} },
                { $sort : {"_id.day" : 1} }             
                    ]).toArray()
                resolve(razorpay,paypal,COD)
            
            })
            
        },
        creditRefund:(orderId)=>{
            return new Promise(async(resolve, reject) => {
             const order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
             const userId = order ? order.userId:null
             const amountTOBeCredited = order.totalAmount
             await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$inc:{wallet:amountTOBeCredited}})
             await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:'Refund-Credited'}})
             await db.get().collection(collection.RETURN_COLLECTION).updateOne({orderId:orderId},{$set:{status:'Refund-Credited'}})
             resolve()
            })
        }
}