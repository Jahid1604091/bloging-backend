const express = require('express');
const { check, validationResult } = require('express-validator');
const Subscriber = require('../../models/Subscriber');
const router = express.Router();

router.post('/',[
    check('email','Please enter a valid email address').not().isEmpty().isEmail()
],async(req,res)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        //check if already subscribed
        const isSubscribed = await Subscriber.findOne({email:req.body.email});
        if(isSubscribed){
            return res.status(400).json({msg:"Already Subscribed!"});
        }
        const subscriber = await new Subscriber(req.body);
        await subscriber.save();
        res.json(subscriber);
    } catch (error) {
        console.error(`Error in subscribing : ${error.message}`);
        return res.status(500).send('Server Error!');
    }
});

module.exports = router;