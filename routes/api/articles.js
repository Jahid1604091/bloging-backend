
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const Article = require('../../models/Article');

//@route    POST api/articles
//@desc     create new article
//@access   Protected
router.post('/', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'A brief description is required').not().isEmpty(),
    check('tag', 'A Tag is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const article = await new Article({
            ...req.body, user: req.user.id
        });
        await article.save();
        return res.status(201).json(article);

    } catch (error) {
        console.error(`Error in creating article : ${error.message}`);
        return res.status(500).send('Server Error!');
    }

});


//@route    GET api/articles
//@desc     show all articles
//@access   Public
router.get('/', async (req, res) => {
    try {
        //for searching
        const q = req.query.q ? {
            title:{
                $regex:req.query.q,
                $options:'i'
            },
            description:{
                $regex:req.query.q,
                $options:'i'
            }
        } : {}
        const articles = await Article.find({...q});
        res.status(200).json(articles)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

//@route    GET api/articles/:tag
//@desc     search all articles by tag
//@access   Public
router.get('/:tag', async (req, res) => {
    try {
      
        const articles = await Article.aggregate([{$match:{tag:req.params.tag}}]);
        res.status(200).json(articles)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

//@route    PUT api/articles/:id
//@desc     edit an article
//@access   Protected
router.put('/:id', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            res.status(404).json({ msg: 'Article Not Found' });
        }
        article.title = req.body.title || article.title
        article.description = req.body.description || article.description

        const updatedArticle = await article.save();
        res.json(updatedArticle)
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: "Article Not Found !" });
        }
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/articles/:id
//@desc     delete an article
//@access   Protected
router.delete('/:id', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            res.status(404).json({ msg: 'Article Not Found' });
        }
        await article.remove();
        res.json({ msg: 'Article Deleted !' })
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: "Article Not Found !" });
        }
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});


//@route    put api/articles/like/:id
//@desc     like an article
//@access   Protected
router.put('/like/:id', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        //check if article already liked
        if (article.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "Article already liked !" });
        }
        article.likes.unshift({ user: req.user.id });
        await article.save();
        res.json(article.likes);

    } catch (error) {
        console.error(`Error in liking article : ${error.message}`);
        return res.status(500).send('Server Error!');

    }
});


//@route    put api/articles/unlike/:id
//@desc     unlike an article
//@access   Protected
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        //check if article is not liked yet, then we can like
        if (article.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: "Article not liked yet!" });
        }

        //get removeIndex
        const removeIndex = article.likes.map(like => like.user.toString()).indexOf(req.user.id);
        article.likes.splice(removeIndex, 1);
        await article.save();
        res.json(article.likes);

    } catch (error) {
        console.error(`Error in unliking article : ${error.message}`);
        return res.status(500).send('Server Error!');

    }
});


//@route    put api/articles/comment/:id
//@desc     comment on article
//@access   Protected
router.put('/comment/:id', [auth,[
    check('text','A Comment is Required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const article = await Article.findById(req.params.id);
        if (!article) {
            res.status(404).json({ msg: 'Article Not Found' });
        }

        const newComment = {
            text:req.body.text,
            name:user.f_name,
            user: req.user.id,
            avatar:user.avatar
        }



        article.comments.unshift(newComment); 

        await article.save();
        res.json(article.comments)

    } catch (error) {
        console.error(`Error in liking article : ${error.message}`);
        return res.status(500).send('Server Error!');

    }
});


//@route    delete api/articles/:id/comment/:cmt_id
//@desc     delete a comment
//@access   Protected
router.delete('/:id/comment/:cmt_id',auth,async(req,res)=>{
    try {
        const article = await Article.findById(req.params.id);
        if(!article){
            return res.status(404).json({msg:"Article Not Found!"});
        }

      
        const comment = article.comments.find(cmt=>cmt.id === req.params.cmt_id);
       
        if(!comment){
            return res.status(404).json({msg:"No Comment yet on this Article!"});
        }
        if(comment.user.toString() !== req.user.id){
            return res.status(400).json({msg:"You can not delete others comment"})
        }
     
        const removeIndex = article.comments.map(like => like.user.toString()).indexOf(req.user.id);
        article.comments.splice(removeIndex, 1);
        await article.save();
        res.json(article.comments);

    } catch (error) {
        console.error(`Error in deleting article comment : ${error.message}`);
        return res.status(500).send('Server Error!');

    }
});



module.exports = router;