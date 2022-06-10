/* eslint-disable max-len */
const express = require('express');
const router = new express.Router();
const User = require('../models/userModel');
const auth=require('../middleware/auth');
const multer=require('multer');
const sharp=require('sharp');
const mail = require('../helper/mailingServices');


const upload=multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    // if (!file.originalname.match(/\.(doc|docx)$/)) {
    //   return cb(new Error('Please uoload word document'));
    // }
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload file in jpg, jpeg or png format'));
    }
    cb(undefined, true);
    // cb(new Error('File must be an image'));
    // cb(undefined, true);
  },
});

// eslint-disable-next-line max-len
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
  // eslint-disable-next-line max-len
  const buffer=await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
  req.user.avatar=buffer;
  await req.user.save();
  return res.status(200).send('File uploaded successfully');
}, (error, req, res, next)=>{
  res.status(400).send({error: error.message});
});
router.delete('/users/me/avatar', auth, async (req, res)=>{
  req.user.avatar=undefined;
  await req.user.save();
  res.send('avatar removed successfully');
});
router.get('/users/:id/avatar', async (req, res)=>{
  try {
    const user=await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    return res.status(404).send(e);
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token=await user.generateAuthToken();
    const mailOptions = {
      from: 'malikagulati015@gmail.com',
      to: user.email,
      subject: 'Registration email',
      text: 'Welcome to the app. Let me know how you get along with the app.',
    };
    mail.transport.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent' + info.response);
      }
    });
    res.status(201).send({user: user, token: token});
  } catch (e) {
    return res.status(400).send(e);
  }
});
// user.save().then(()=>{
//     res.status(201).send(user)

// }).catch((error)=>{
//     return res.status(400).send(error)
// })
router.post('/users/login', async (req, res)=>{
  try {
    const user=await User.findByCredentials(req.body.email, req.body.password);
    // console.log(user);
    // eslint-disable-next-line max-len
    const token=await user.generateAuthToken();
    res.send({user: user, token: token});
  } catch (e) {
    return res.status(500).send(e);
  }
});
router.post('/users/logout', auth, async (req, res)=>{
  try {
    // explanation for thos logic is given through a example from line 126-131
    req.user.tokens=req.user.tokens.filter((token)=>{
      console.log(token);
      return token.token!==req.token1;
    });
    req.user.save();
    res.status(200).send('you are logged out!');
  } catch (e) {
    return res.status(500).send(e);
  }
});
router.post('/users/logoutAll', auth, async (req, res)=>{
  try {
    req.user.tokens=[];
    req.user.save();
    res.status(200).send('you are logged out from all your devices!');
  } catch (e) {
    return res.status(500).send(e);
  }
});
router.get('/users/me', auth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (e) {
    return res.status(500).send(e);
  }
});
// User.find({}).then((users)=>{
//     res.status(200).send(users)

// }).catch((e)=>{
//     res.status(500).send(e)
// })
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send('User not found');
    }
    return res.status(200).send(user);
  } catch (e) {
    return res.status(500).send(e);
  }
});
// // User.findById({where:{_id:req.params.id}})
// User.findById(req.params.id).then((user)=>{
//     if(!user){
//         return res.status(404).send("User not found")
//     }
//     return res.status(200).send(user)

// }).catch((e)=>{
//    return res.status(500).send(e)
// })
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'age', 'password'];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'});
  }
  try {
    const user= await User.findById(req.user._id);
    updates.forEach((update)=>{
      user[update]=req.body[update];
    });
    user.save();
    // eslint-disable-next-line max-len
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
    // if (!user) {
    //   return res.status(404).send('User not found');
    // }
    return res.status(200).send(user);
  } catch (e) {
    return res.status(400).send(e);
  }
});
router.delete('/users/me', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send({error: 'No user found'});
    // }
    const mailOptions = {
      from: 'malikagulati015@gmail.com',
      to: req.user.email,
      subject: 'Cancellation email',
      text: 'Hope to see you soon!',
    };
    mail.transport.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent' + info.response);
      }
    });
    await req.user.remove();
    return res.status(200).send(req.user);
  } catch (e) {
    return res.status(500).send(e);
  }
});
// ------------------------------------------------------


module.exports = router;
// const user=this, user.generateAuthToken()
// why have we used concat for tokens in user model?
// logout functionality


// let arr=[1,3,5]
// arr=arr.filter((i)=>{
//   return i!==3;

// })
// console.log(arr)
