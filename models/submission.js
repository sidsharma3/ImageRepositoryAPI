const mongoose = require('mongoose');
// this import below allows us to reference other models
const { ObjectId } = mongoose.Schema;

const submissionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        fileID: {
            type: String,
        },
        fileName: {
            type: String,
        },
        body: {
            type: {},
            required: true,
            min: 200,
            max: 2000000
        },
        feedback: {
            type: {},
            min: 20,
            max: 2000000
        },
        excerpt: {
            type: String,
            max: 1000
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
        },
        categories: [{ type: ObjectId, ref: 'Category', required: true }],
        tags: [{ type: ObjectId, ref: 'Tag', required: true }],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);