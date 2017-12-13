var express = require("express");
var app = express();
var mongoose = require("mongoose");
var path = require("path");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded());
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
app.get("/", function(req, res) {
    post.find({}, false, true).populate('_comments').exec(function(err, posts) {
        res.render('index.ejs', { posts: posts });
    });
});
app.post("/post", function(req, res) {
    var newpost = new post({ name: req.body.name, post: req.body.post });
    newpost.save(function(err) {
        if (err) {
            console.log(err);
            res.render('index.ejs', { errors: newpost.errors });
        } else {
            console.log("success");
            res.redirect('/');
        }
    })
})

app.post("/comment/:id", function(req, res) {
    var postId = req.params.id;
    post.findOne({ _id: postId }, function(err, post) {
        var newComment = new Comment({ name: req.body.name, text: req.body.comment });
        newComment._post = post._id;
        post.update({ _id: post._id }, { $push: { _comments: newComment } }, function(err) {

        });
        newComment.save(function(err) {
            if (err) {
                console.log(err);
                res.render('index.ejs', { errors: newComment.errors });
            } else {
                console.log("comment added");
                res.redirect("/");
            }
        });
    });
});



mongoose.connect('mongodb://127.0.0.1/post_board', function(err, db) {
    if (err) {
        console.log("error here");
        console.log(err);
    }
});

var Schema = mongoose.Schema;
var postSchema = new mongoose.Schema({
    name: String,
    post: String,
    _comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

postSchema.path('name').required(true, 'Name cannot be blank');
postSchema.path('post').required(true, 'post cannot be blank');
mongoose.model("post", postSchema);

var post = mongoose.model("post");
var CommentSchema = new mongoose.Schema({
    name: String,
    text: String,
    _post: { type: Schema.Types.ObjectId, ref: 'post' }
});

CommentSchema.path('name').required(true, 'Name cannot be blank');
CommentSchema.path('text').required(true, 'Comment cannot be blank');
mongoose.model("Comment", CommentSchema);

var Comment = mongoose.model("Comment");

app.listen(8000, function() {
    console.log("server running on port 8000");
});