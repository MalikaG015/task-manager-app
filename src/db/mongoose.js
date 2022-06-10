const mongoose=require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  // useCreateIndex:true

});


// const me=new User({
//     name:"  Neha   ",
//     age:32,
//     email:"neha@gmail.com",
//     password:"neha@123"
// })
// me.save().then(()=>{
//     console.log(me)

// }).catch((error)=>{
//     console.log("error", error)
// })

// const task1=new Tasks({
//     description:"   eat lunch   ",

// })
// task1.save().then(()=>{
//     console.log(task1)
// }).catch((error)=>{
//     console.log("error",error)
// })
