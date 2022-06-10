const express=require('express');
const router=new express.Router();
const Tasks=require('../models/taskModel');
const auth=require('../middleware/auth');

router.post('/task', auth, async (req, res) => {
  try {
    // const task = new Tasks(req.body);
    const task=new Tasks({
      ...req.body,
      author: req.user._id,
    });
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    return res.status(400).send(error);
  }
});
// const task = new Tasks(req.body)
//     task.save().then(() => {
//         res.status(201).send(task)

//     }).catch((error) => {
//         return res.status(400).send(error)
//     })

// pagination=limit+skip
// GET /tasks?limit=10&skip=0(page 1 10 entries)
router.get('/tasks', auth, async (req, res) => {
  try {
    // const match={};
    // // eslint-disable-next-line max-len
    // if (req.query.completed) {
    //   match.completed=req.query.completed==='true';
    // }
    console.log(10);
    // await req.user.populate({
    //   path: 'tasks',
    //   match,
    //   options: {
    //     limit: 2,
    //   },
    // }).execPopulate();
    // console.log(20);
    // eslint-disable-next-line max-len
    let tasksList;
    if (req.query) {
      // eslint-disable-next-line max-len
      tasksList=await Tasks.find({author: req.user._id, completed: req.query.completed}).limit(req.query.limit).exec().skip(req.query.skip).sort({createdAt: -1});
      return res.status(200).send(tasksList);
    }
    // eslint-disable-next-line max-len
    tasksList=await Tasks.find({author: req.user._id}).limit(req.query.limit).skip(req.query.skip).sort({createdAt: -1});
    return res.status(200).send(tasksList);
  } catch (e) {
    return res.status(500).send(e);
  }
});
// Tasks.find({}).then((tasks) => {
//     res.status(200).send(tasks)

// }).catch((e) => {
//     return res.status(500).send(e)
// })
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    // const task=await Tasks.findById(req.params.id);
    const task=await Tasks.findOne({_id: req.params.id, author: req.user._id});
    console.log(task);
    if (!task) {
      return res.status(404).send('No task found');
    }
    return res.status(200).send(task);
  } catch (e) {
    return res.status(500).send(e);
  }
});
// Tasks.findById(req.params.id).then((tasks) => {
//     if (!tasks) {
//         return res.status(404).send("No task found")
//     }
//     return res.status(200).send(tasks)

// }).catch((e) => {
//     return res.status(500).send(e)
// })


router.patch('/tasks/:id', auth, async (req, res)=>{
  const updates=Object.keys(req.body);
  const allowedUpdates=['description', 'completed'];
  const validUpdate=updates.every((update)=>{
    return allowedUpdates.includes(update);
  });
  if (!validUpdate) {
    return res.status(400).send({error: 'Invalid updates!'});
  }
  try {
    const task=await Tasks.findOne({_id: req.params.id, author: req.user._id});
    if (!task) {
      return res.status(404).send('Task not found');
    }
    // update through forEach
    updates.forEach((update)=>{
      task[update]=req.body[update];
    });
    await task.save();
    // updates.forEach((update)=>{
    //   console.log(update);
    //   console.log(task[update]);
    //   console.log(req.body[update]);
    // });

    // eslint-disable-next-line max-len
    // const task=await Tasks.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
    return res.status(200).send(task);
  } catch (e) {
    return res.status(500).send(e);
  }
});

router.delete('/tasks/:id', auth, async (req, res)=>{
  try {
    // eslint-disable-next-line max-len
    const task=await Tasks.findOneAndDelete({_id: req.params.id, author: req.user._id});
    if (!task) {
      return res.status(404).send({error: 'No task found'});
    }
    return res.status(200).send(task);
  } catch (e) {
    return res.status(500).send(e);
  }
});
module.exports=router;

