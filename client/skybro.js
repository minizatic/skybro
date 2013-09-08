function include(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
}

Meteor.autosubscribe(function () {
    Meteor.subscribe("userData");
});

Deps.autorun(function () {
document.title = Session.get("pageTitle") + " | Skybro";
});

Session.set("searchQuery", "");
Session.set("selectedTags", []);
Session.set("postLimit", 10);

Meteor.subscribe('blogPosts', function onComplete() {
  Session.set('postsLoaded', true);
});
blogPosts = new Meteor.SmartCollection("blogPosts");

Meteor.subscribe("tags");
tags = new Meteor.SmartCollection("tags");

Meteor.subscribe("comments");
comments = new Meteor.SmartCollection("comments");

Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});

Template.blogPosts.ready = function(){
	return Session.get('postsLoaded');
}

Template.editPost.rendered = function(){
	if(Session.equals("reRender", true)){
		$('#wysihtml5-textarea').wysihtml5();
	}
}

Template.blogPosts.more = function(){
	return Session.get("morePosts");
}

Template.navbar.events({
	'click #newPost': function(e){
		Meteor.Router.to('/');
		Session.set("clickedEdit", true);
		Session.set("reRender", true);
		$('div.span6.editor').html(Meteor.render(Template.editPost));
	},
	'keyup #search': function(e){
		Session.set("searchQuery", $(e.target).val());
	}
});

Template.editPost.events({
	'click .closeEdit': function(e){
		Session.set("clickedEdit", false);
		Session.set("editing", false);
		Session.set("editing_post", undefined);
		Session.set("addingTag", false);
	},
	'click .addTag': function(e){
		Session.set("addingTag", true);
	},
	'click .createTag': function(e){
		e.preventDefault();
		if($('#newTag').val() == ""){
			Session.set("reRender", false);
			$('.postError').html(Meteor.render(Template.error({Error: "Tag may not be blank"})));
		}else{
		tags.insert({tag: $('#newTag').val()});
		Session.set("addingTag", false);
		}
	},
	'click #submitPost': function(e){
		e.preventDefault();
		var post = {};
		post.title = $('input#title').val();
		post.body = $('#wysihtml5-textarea').val();
		if (post.title != ""){
			if(post.body != ""){
			post.author = Meteor.user().username;
			post.tags = [];
			post.pubdate = new Date();
			$('select#tags option:selected').each(function(i){
				post.tags[i] = $(this).val();
			})
			if(Session.get("editing_post")){
				var _id = Session.get("editing_post")._id;
				blogPosts.update({_id: _id}, {$set: post});
			}else{
				post.comments = [];
				blogPosts.insert(post);

			}
			Session.set("clickedEdit", false);
			Session.set("editing", false);
			Session.set("editing_post", undefined);
			Session.set("addingTag", false);
			}else{
				Session.set("reRender", false);
				$('.postError').html(Meteor.render(Template.error({Error: "Post body may not be blank"})));
			}
		}else{
			Session.set("reRender", false);
			$('.postError').html(Meteor.render(Template.error({Error: "Title may not be blank"})));
		}
	}
});

Template.blogPosts.events({
	'click .editPost': function(e){
		var _id = $(e.target).closest("div").attr("id");
		var post = blogPosts.findOne({_id: _id});
		Session.set("editing_post", post);
		Session.set("editing", true);
		Session.set("clickedEdit", true);
		Session.set("reRender", true);
		$('div.span6.editor').html(Meteor.render(Template.editPost));
	},
	'click .deletePost': function(e){
		var _id = $(e.target).closest("div").attr("id");
		blogPosts.remove({_id: _id});
	},
	'click a.tagged': function(e){
		var tags = Session.get("selectedTags");
		if(include(tags, $(e.target).text()) != true){
		tags.push($(e.target).text());
		}
		Session.set("selectedTags", tags);
	},
	'click a.morePosts': function(e){
		var limit = Session.get("postLimit");
		limit = limit + 10;
		Session.set("postLimit", limit);
	}
});

Template.footer.events({
	'click .deSelect': function(e){
		var tags = Session.get("selectedTags");
		var index = tags.indexOf($(e.target).closest("span").attr("id"));
		tags.splice(index, 1);
		Session.set("selectedTags", tags);
	}
});

Template.onePost.theComments = function(){
	if(Template.onePost.post()){
	return comments.find({_id: {$in: Template.onePost.post().comments}});
	}
}

Template.onePost.editComment = function(){
	return Session.get("editingComment");
}

Template.onePost.events({
	'click a.comment': function(e){
		Session.set("postingComment", true);
	},
	'click a.exitComment': function(e){
		Session.set("comment_id", undefined);
		Session.set("editingComment", undefined);
		Session.set("postingComment", false);
	},
	'click button#submitComment': function(e){
		var commentObj = {};
		commentObj.comment = $('textarea#comment').val();
		if(commentObj.comment != ""){
			commentObj.author = Meteor.user().username;
			if(!Session.equals("editingComment", undefined)){
					comments.update({_id: Session.get("comment_id")}, {$set: commentObj});
			}else{
				commentObj.pubdate = new Date();
				var id = comments.insert(commentObj);
				blogPosts.update({_id: Session.get("currentPost")}, {$push: {comments: id}});
			}
			Session.set("comment_id", undefined);
			Session.set("editingComment", undefined);
			Session.set("postingComment", false);
		}else{
			Session.set("reRender", false);
			$('.commentError').html(Meteor.render(Template.error({Error: "Comment may not be blank"})));
		}
	},
	'click a.deleteComment': function(e){
		var id = $(e.target).parent().parent().attr("id");
		blogPosts.update({_id: Session.get("currentPost")}, {$pull: {comments: id}});
		comments.remove({_id: id});
	},
	'click a.editComment': function(e){
		var id = $(e.target).parent().parent().attr("id");
		Session.set("comment_id", id);
		Session.set("editingComment", comments.findOne({_id: id}).comment);
		Session.set("postingComment", true);
	}
});
Template.navbar.loggedIn = function(){
	if(Meteor.user()){
		return true;
	}else{
		return false;
	}
}

Template.footer.selectedTags = function(){
	return Session.get("selectedTags");
}

Template.blogPosts.userMatch = function(user){
	if(Meteor.user()){
	if(user == Meteor.user().username || Meteor.user().admin == true){
		return true;
	}else{
		return false;
	}
}
}

var commentCount = function(comments){
	if(comments.length == 1){
		return "1 Comment";
	}else{
		return comments.length + " Comments";
	}
}

Template.blogPosts.numComments = function(comments){
	return commentCount(comments);
}

Template.onePost.numComments = function(comments){
	return commentCount(comments);
}

Template.onePost.userMatch = function(user){
	if(Meteor.user()){
	if(user == Meteor.user().username || Meteor.user().admin == true){
		return true;
	}else{
		return false;
	}
}
}

Template.onePost.loggedIn = function(){
	return Meteor.user()
}

Template.blogPosts.posts = function(){
	searchExp = new RegExp(".*" + Session.get("searchQuery") + ".*", "i");
	if(Session.get("selectedTags") == ""){
		query = {$exists: true};
	}else{
		query = {$in: Session.get("selectedTags")};
	}
	posts = blogPosts.find({tags: query, $or:[{title: searchExp}, {body: searchExp}]}, {sort: {pubdate: -1}, limit: Session.get("postLimit")});
	gotposts = posts.fetch();
	if(gotposts.length == 0){
		Session.set("noResults", true);
	}else{
		Session.set("noResults", false);
	}
	if(gotposts.length < Session.get("postLimit")){
		Session.set("morePosts", false);
	}else{
		Session.set("morePosts", true);
	}
	return posts;
}

Template.blogPosts.noResults = function(){
	return Session.get("noResults");
}

Template.editPost.clickedEdit = function(){
	return Session.get("clickedEdit");
}

Template.editPost.addingTag = function(){
	return Session.get("addingTag");
}

Template.editPost.post = function(){
	if(Session.equals("editing", true)){
		return Session.get("editing_post");
	}else{
		return null;
	}
}

Template.editPost.tags = function(){
	var editTags = tags.find({});

		editTags = editTags.fetch();
		for(i=0;i<editTags.length; i++){
			if(Session.get("editing_post")){
			if(include(Session.get("editing_post").tags, editTags[i].tag)){
				editTags[i].selected = true;
			}
			}
		}
		return editTags;
}

Meteor.Router.add({
   '/':function(){
   		Session.set("home", true);
   		Session.set("clickedEdit", false);
   		Session.set("currentPost", undefined);
   		Session.set("viewingAbout", false);
   		Session.set("pageTitle", "Home");
   		return 'home';
   },

   '/posts/:id': function(id) {
   	Session.set("currentPost", id);
   	Session.set("viewingAbout", false);
   	Session.set("home", false);
    return 'onePost';
  },
  '/about': function(){
  	Session.set("viewingAbout", true);
  	Session.set("home", false);
  	Session.set("currentPost", undefined);
  	Session.set("pageTitle", "About");
  	return 'about';
   }
});

Template.onePost.post = function(){
	if(!Session.equals("currentPost", undefined)){
		var post = blogPosts.findOne({_id: Session.get("currentPost")});
		if(post){
			Session.set("pageTitle", post.title);
			return post;
		}else{
			return undefined;
		}
	}
	return undefined;
}

Template.navbar.currentPost = function(){
	return blogPosts.findOne({_id: Session.get("currentPost")});
}
Template.navbar.viewingAbout = function(){
	return Session.get("viewingAbout");
}
Template.navbar.home = function(){
	return Session.get("home");
}

Template.onePost.postingComment = function(){
	return Session.get("postingComment");
}