const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const routertask = new express.Router()

routertask.get('/tasks',auth, async (req, res) => {
    try {
        
        const user = req.user
        const match={}
        const sort={}
        if(req.query.sortBy){
            const parts=req.query.sortBy.split(':')
            sort[parts[0]] =  parts[1]==='desc'?-1:1
        }
       // console.log(sort)
       if(req.query.completed)
           match.completed = req.query.completed === 'true'

        await user.populate({
            path:'tasks',


            
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(user.tasks)
    } catch (e) {
       // console.log(e)
        res.status(500).send()
    }
})


routertask.get('/tasks/:id',auth, async (req, res) => {
    try {
        //const task = await Task.findById(req.params.id)
        const task= await Task.findOne({_id:req.params.id,owner:req.user._id})
        res.send(task)
    } catch (e) {

        console.log(e)
        res.status(500).send()

    }
})

routertask.post('/tasks',auth, async (req, res) => {
  
   const task  =new Task({
       ...req.body,
       owner:req.user._id
   })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        console.log(e)
        res.status(e).send()
    }
})


routertask.delete('/tasks/:id',auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user.id})
        if (!task)
            return res.status(404).send()
            await task.remove()
        res.send(task)
    } catch (e) {
       // console.log(e)
        res.status(500).send()
    }
})

routertask.patch('/tasks/:id',auth, async (req, res) => {
 
    try {
        const task = await Task.findOne({ _id:req.params.id,owner:req.user._id})
        //console.log(task, req.user._id)
        if (!task)
            res.status(404).send()

        const updates = Object.keys(req.body)
        const allowedUpdates = ['description', 'completed']
        const valid = updates.every((up) => allowedUpdates.includes(up))

        if (!valid)
            return res.status(400).send()

        updates.forEach((update) => task[update]=req.body[update]);
         await  task.save()

        res.send(task)
    } 
    catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

module.exports=routertask
