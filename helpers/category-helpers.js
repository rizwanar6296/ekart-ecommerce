const db = require('../config/connections')
const collection = require('../config/collections')
const objectId=require('mongodb').ObjectId

module.exports={
    getBrands:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find({brand:{$exists:true}}).toArray().then((brand)=>{
                resolve(brand)
            })
        })    
    },
    deleteBrand:(brandId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(brandId)}).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    addBrand:(brandDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(brandDetails).then((data)=>{
                console.log(data)
                resolve(data)
            })
        })
    },
    addType:(type)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.NEWCATEGORY).updateOne({},{$addToSet:{type:type}},{$upsert:true}).then((data)=>{
                resolve(data)
            })
        })
    },
    getCategory:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((category)=>{
                console.log(category)
                resolve(category[0])
            })
        })
    },
    getBrand:(brandId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(brandId)}).then((brandDetails)=>{
                resolve(brandDetails)
            })
        })
    },
    editBrand:(brandId,brandDetails)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(brandId)},{$set:brandDetails},{$upsert:true}).then(()=>{
                resolve()
            })
        })
    }
}