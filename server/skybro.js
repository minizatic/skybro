Meteor.startup(function () {
  if(blogPosts.find({}).count() == 0){
    tags.insert({tag: "automated"}, function(err, tag){
      if(err){
        console.log(err);
      }else{
        comments.insert({
          comment: "hello world!",
          author: "robot commenter",
          pubdate: new Date()
        }, function(err, _id){
          if(err){
            console.log(err);
          }else{
            blogPosts.insert({
              title: "Welcome to Skybro",
              body: "This is a sample blog post set up by the Skybro server. Delete this post and start blogging!",
              author: "The Skybro Robot",
              pubdate: new Date(),
              tags: ["automated"],
              removeable: true,
              comments: [_id]
            });

          }
        });
      }
    });
  }
});

var blogPosts = new Meteor.Collection("blogPosts");
var tags = new Meteor.Collection("tags");
var comments = new Meteor.Collection("comments");

Meteor.publish("blogPosts", function(){
  return blogPosts.find({});
});

Meteor.publish("tags", function(){
  return tags.find({});
});

Meteor.publish("comments", function(){
  return comments.find({});
});

tags.allow({
  insert: function(userId, doc){
    return userId;
  }
});

comments.allow({
  insert: function(userId, doc){
    return userId;
  }
})

blogPosts.allow({
  insert: function(userId, doc){
    return userId;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.author === Meteor.user().username && ! _.contains(fields, ['comments']) || ! _.contains(fields, ['title', 'body', 'author', '_id', 'pubdate', 'removeable', 'tags']);
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.author === Meteor.user().username || doc.removeable === true;
  }
});

