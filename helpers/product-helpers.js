const db = require('../config/connections')
const collection = require('../config/collections')
const objectId=require('mongodb').ObjectId

module.exports={
    getAllProductDetails:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray().then((productDetails)=>{
                resolve(productDetails)
            })
        })
    },
    brandWiseProducts:(brandId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).find({brand:brandId}).toArray().then((products)=>{
                resolve(products)
            })
        })
    },
    addProduct:(productDetails)=>{
        return new Promise((resolve, reject) => {
            // db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(productDetails,function(err,docsInserted){
            //   
            // })
            // .then((data)=>{
            // 
            //     resolve(data) 
            // })
            productDetails.visibility=true
            db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(productDetails).then((data)=>{
            //    let productId= JSON.stringify(data.insertedId).replaceAll("\"","")
                resolve(data) 
            })
        })
    },
    getProductDetails:(productId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({_id:objectId(productId)}).then((productDetails)=>{
                resolve(productDetails)
            })
        })
    },
    updateProduct:(productId,productDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:objectId(productId)},{$set:productDetails}).then((data)=>{
                resolve(data)
            })
        })
    },
    deleteProduct:(productId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({_id:objectId(productId)}).then(()=>{
                resolve()
            })
        })
    },
    blockVisibility:(productId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:objectId(productId)},{$set:{visibility:false}}).then((data)=>{
                resolve(data);
            })
        })
    },
    unBlockVisibility:(productId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:objectId(productId)},{$set:{visibility:true}}).then((data)=>{
                resolve(data);
            })
        })
    },
    getProductsCount:()=>{
        return new Promise(async(resolve, reject) => {
          count= await db.get().collection(collection.PRODUCTS_COLLECTION).countDocuments()
          resolve(count)
        })
    },
    getPaginatedResult:(limit,startIndex)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).find().limit(limit).skip(startIndex).toArray().then((result)=>{
                resolve(result)
            })
        })
    },getBrandWiseResult:(brands,limit,startIndex)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).find({brand:{$in:brands}}).toArray().then((result)=>{
                resolve(result)
            })
        })
    },
    getTotalSalesGraph:()=>{
        return new Promise (async(resolve,reject)=>{
            let weeklySale=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'

                },
                {
                    $match:{
                        status:{$nin:['cancelled']}
                    }
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$totalAmount'} 
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:7
                },
                {
                    $sort:{
                        _id:1
                    }
                }
            ]).toArray()

            // let monthlySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            //     {
            //         $match:{
            //             status:{$nin:['cancelled']}
            //         }
            //     },
            //     {
            //         $group:{
            //              _id:{date:'$date'},
            //             totalAmount:{$sum:'$totalAmount'} 
            //         }
            //     },
            //     {
            //         $sort:{
            //             _id:-1
            //         }
            //     },
            //     {
            //         $limit:7
            //     },
            //     {
            //         $sort:{
            //             _id:1
            //         }
            //     }
                

            // ]).toArray()

           
            // let yearlySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            //     {
            //         $match:{
            //             status:{$nin:['cancelled']}
            //         }
            //     },
            //     {
            //         $group:{
            //              _id:{date:'$date'},
            //             totalAmount:{$sum:'$totalAmount'} 
            //         }
            //     },
            //     {
            //         $sort:{
            //             _id:-1
            //         }
            //     },
            //     {
            //         $limit:7
            //     },
            //     {
            //         $sort:{
            //             _id:1
            //         }
            //     }
                

            // ]).toArray()

             resolve({weeklySale}) 


        })

    },
    searchProducts:(payload)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).find({productName:{$regex: new RegExp('^'+payload+'.*','i')}}).limit(5).toArray().then((products)=>{
                resolve(products)
            })
        })
    }   
}
