Meteor.startup(function () {
    if(blogPosts.find({}).count() == 0){
      tags.insert({tag: "automated"}, function(err, tag){
        if(err){
          console.log(err);
        }else{
          blogPosts.insert({
            title: "Welcome to inkly",
            body: "This is a sample blog post set up by the inkly server. Delete this post and start blogging!",
            author: "The inkly Robot",
            pubdate: new Date(),
            tags: ["automated"],
            removeable: true,
            comments: [{comment: "hello world", author: "not you", pubdate: new Date()}]
          });
        }
      });
    }
  });

var blogPosts = new Meteor.Collection("blogPosts");
var tags = new Meteor.Collection("tags");

Meteor.publish("blogPosts", function(){
  return blogPosts.find({});
});

Meteor.publish("tags", function(){
  return tags.find({});
});

tags.allow({
  insert: function(userId, doc){
    return userId;
  }
});

blogPosts.allow({
  insert: function(userId, doc){
    return userId;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.author === Meteor.user().username || ! _.contains(fields, ['title', 'body', 'author', '_id', 'pubdate', 'removeable', 'tags']);
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.author === Meteor.user().username || doc.removeable === true;
  }
});

