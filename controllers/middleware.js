module.exports={
    userValidate:(req, res, next)=>{
        if (req.session.user) {
          res.redirect('/')
        } else {
          next()
        }
      },
      userVerifyLogin:(req, res, next)=>{
        if (req.session.user) {
          next()
        } else {
          res.redirect('/login')
        }
      },
    urlHistory:(req,res,next)=>{
      if(!req.xhr&&req.method!='POST'&&req.url!='/login'){
        req.session.url = req.url
        next()
        }else{
          next()
        }
    }
   
}