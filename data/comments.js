const mongoCollections = require('../config/mongoCollections');
const comments = mongoCollections.comments;
const users = require('./users');
const games = require('./games');
const uuid = require('uuid');

const exportedMethods = {

    async getAllComments() {
        const commentCollection = await comments();
        return await commentCollection.find({}).toArray();
    },

    async getCommentById(id) {
        if (!id) throw new Error('You must provide an id');

        const commentCollection = await comments();
        const post = await commentCollection.findOne({ _id: id });

        if (!post) throw 'Post not found';

        return post;
    },

    async addCommentToGame(gameId, commenterId, commentText) {
        if (!gameId) throw new Error('You must provide a game id');
        if (!commentText) throw new Error('You must provide a comment');
        if (!commenterId) throw new Error('You must provide a commenterId');

        const commentCollection = await comments();

        const userThatCommented = await users.getUserById(commenterId);

        const newComment = {
            _id: uuid.v4(),
            commentText: commentText,
            gameId: gameId,
            commenter: {
                commenterId: commenterId,
                name: `${userThatCommented.firstName} ${userThatCommented.lastName}`
            },
        };

        const newInsertInformation = await commentCollection.insertOne(newComment);

        await games.addCommentToGame(gameId, newComment);

        return await this.getCommentById(newComment._id);
    },


    //   async removePost(id) {
    //     const commentCollection = await posts();
    //     let post = null;
    //     try {
    //       post = await this.getPostById(id);
    //     } catch (e) {
    //       console.log(e);
    //       return;
    //     }
    //     const deletionInfo = await commentCollection.removeOne({_id: id});
    //     if (deletionInfo.deletedCount === 0) {
    //       throw `Could not delete post with id of ${id}`;
    //     }
    //     await users.removePostFromUser(post.poster.id, id);
    //     return true;
    //   },

    //   async updatePost(id, updatedPost) {
    //     const commentCollection = await posts();

    //     const updatedPostData = {};

    //     if (updatedPost.tags) {
    //       updatedPostData.tags = updatedPost.tags;
    //     }

    //     if (updatedPost.title) {
    //       updatedPostData.title = updatedPost.title;
    //     }

    //     if (updatedPost.body) {
    //       updatedPostData.body = updatedPost.body;
    //     }

    //     await postCollection.updateOne({_id: id}, {$set: updatedPostData});

    //     return await this.getPostById(id);
    //   },

};

module.exports = exportedMethods;