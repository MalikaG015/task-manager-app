const jwt=require('jsonwebtoken');
const User=require('../models/userModel');
const auth=async (req, res, next)=>{
  try {
    const token=req.header('Authorization');
    const splitToken=token.split(' ');
    const decoded=jwt.verify(splitToken[1], process.env.JWT_SECRET);
    const token1=splitToken[1];
    // eslint-disable-next-line quote-props
    const user=await User.findOne({_id: decoded._id, 'tokens.token': token1});
    if (!user) {
      throw new Error;
    }
    req.token1=token1;
    req.user=user;
    next();
  } catch (e) {
    return res.status(401).send({error: 'Please authenticate'});
  }
};
module.exports=auth;
