const express = require('express');
require('./db/mongoose');


const userRouter=require('./routers/user');
const taskRouter=require('./routers/task');
const app = express();
const port = process.env.PORT;

// app.use((req, res, next)=>{
//   console.log(req.method, req.path);
//   // eslint-disable-next-line max-len
// eslint-disable-next-line max-len
//   return res.status(503).send('Cannot serve any request as server is in maintenance');
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
// X5ceKs2SJ8PF4Vuk
// mongodb+srv://taskapp:<password>@cluster0.ojtlo.mongodb.net/test
// mongodb password- malikataskapp
// username- taskapp
// line 120
// async-await.js

// ESLint

// "test": "echo \"Error: no test specified\" && exit 1"
