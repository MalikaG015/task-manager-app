/* eslint-disable max-len */
const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const Tasks = require('./taskModel');
const userSchema=new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value<0) {
        throw new Error('Age must be postive number');
      }
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is not valid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('password should not contain the word password');
      }
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  avatar: {
    type: Buffer,
  },

}, {timestamps: true});
userSchema.virtual('tasks', {
  ref: 'Tasks',
  localField: '_id',
  foreignField: 'author',
});
userSchema.methods.toJSON= function() {
  const user=this;
  const userObject=user.toObject();
  // deletinh here meand that not showing in the response from the associated APIs
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};
userSchema.methods.generateAuthToken=async function() {
  const user=this;
  const token=jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '7 days'});
  user.tokens=user.tokens.concat({token: token});
  await user.save();
  return token;
};
userSchema.statics.findByCredentials=async (email, password)=>{
  const user=await User.findOne({email: email});
  if (!user) {
    throw new Error('Unable to login!');
  }
  const isMatch=await bcrypt.compare(password, user.password);
  console.log(isMatch);
  if (!isMatch) {
    throw new Error('Unable to Login!');
  }
  return user;
};

// hash the plain text password
userSchema.pre('save', async function(next) {
  const user=this;
  if (user.isModified('password')) {
    user.password=await bcrypt.hash(user.password, 8);
  }
  next();
});

// delete tasks when user is deleted
userSchema.pre('remove', async function(next) {
  const user=this;
  await Tasks.deleteMany({author: user._id});
  next();
});
const User=mongoose.model('User', userSchema);
module.exports=User;
