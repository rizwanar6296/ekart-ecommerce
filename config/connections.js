const mongoClient=require('mongodb').MongoClient
const state={
   db:null
}
module.exports.connect=function(done){
    const url='mongodb+srv://rizwan:rizwan123@cluster0.u2hllmq.mongodb.net/test'
    const dbname='ekart'
          
    mongoClient.connect(url,(err,data)=>{
        if(err)return done(err)
        state.db=data.db(dbname)
        done()
       
    }) 
    
}    
module.exports.get=function(){
    return state.db
}
