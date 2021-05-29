const Submission = require('../models/submission');
const Category = require('../models/category');
const Tag = require('../models/tag');
const User = require('../models/user');
const formidable = require('formidable');
const slugify = require('slugify');
const { stripHtml } = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/submission');
var cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dlgtho53p',
    api_key: '433946476562715',
    api_secret: '5H2EnZTV4KZLa6SQepZqLtQ-as8'
});

function saveSubmission(submission, arrayOfCategories, arrayOfTags, res) {
    submission.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        Submission.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec(
            (err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                } else {
                    Submission.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true }).exec(
                        (err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    error: errorHandler(err)
                                });
                            } else {
                                res.json(result);
                            }
                        }
                    );
                }
            }
        );
    });    
}

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'File could not upload'
            });
        }

        const { title, body, categories, tags } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }

        if (!body || body.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least one tag is required'
            });
        }

        let submission = new Submission();

        submission.title = title;
        submission.body = body;
        submission.excerpt = smartTrim(body, 320, ' ', ' ...');
        submission.slug = slugify(title).toLowerCase();
        submission.mtitle = `${title} | ${process.env.APP_NAME}`;
        submission.mdesc = stripHtml(body.substring(0, 160)).result;
        submission.postedBy = req.auth._id;
        // categories and tags
        let arrayOfCategories = categories && categories.split(',');
        let arrayOfTags = tags && tags.split(',');
        // Does the formidable form contain a photo
        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'File should be less then 1mb in size'
                });
            }
            cloudinary.uploader.upload(files.photo.path, { public_id: submission.slug }, function(err, result) {
                if (err) {
                    return res.status(400).json({
                        error: "Issue uploading file"
                    });
                }
                var splitURL = result.url.split("/")
                submission.fileName = splitURL[splitURL.length - 1]
                submission.fileID = splitURL[splitURL.length - 2]
                saveSubmission(submission, arrayOfCategories, arrayOfTags, res)
            });
        } else {
            saveSubmission(submission, arrayOfCategories, arrayOfTags, res)
        }
    });
};

// Get all the submissions
exports.list = (req, res) => {
    Submission.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title fileID fileName slug excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};

exports.listAllSubmissionsCategoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let submissions;
    let categories;
    let tags;
    // find all submissions to a certain limit sorted by createdAt date
    Submission.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id title fileID fileName slug excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            submissions = data;
            // get all categories
            Category.find({}).exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categories = c; // categories
                // get all tags
                Tag.find({}).exec((err, t) => {
                    if (err) {
                        return res.json({
                            error: errorHandler(err)
                        });
                    }
                    tags = t;
                    // return all submissions categories tags
                    res.json({ submissions, categories, tags, size: submissions.length });
                });
            });
        });
};

// Read one specific submission
exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Submission.findOne({ slug })
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title body fileID fileName slug mtitle mdesc categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            console.log(data)
            res.json(data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Submission.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        // remove from cloudinary
        cloudinary.uploader.destroy(slug, function(result) { console.log(result) });
        res.json({
            message: 'Submission deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Submission.findOne({ slug }).exec((err, oldSubmission) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'File could not upload'
                });
            }

            let slugBeforeMerge = oldSubmission.slug;
            oldSubmission = _.merge(oldSubmission, fields);
            oldSubmission.slug = slugBeforeMerge;

            const { body, desc, categories, tags } = fields;

            if (body) {
                oldSubmission.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldSubmission.desc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                oldSubmission.categories = categories.split(',');
            }

            if (tags) {
                oldSubmission.tags = tags.split(',');
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'File should be less then 1mb in size'
                    });
                }
                // reuploading file to cloudinary with same name will cause an update
                cloudinary.uploader.upload(files.photo.path, { public_id: oldSubmission.slug }, function(err, result) {
                    if (err) {
                        return res.status(400).json({
                            error: "Issue uploading file"
                        });
                    }
                    var splitURL = result.url.split("/")
                    oldSubmission.fileName = splitURL[splitURL.length - 1]
                    oldSubmission.fileID = splitURL[splitURL.length - 2]
                    oldSubmission.save((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                        res.json(result);
                    });
                });
            } else {
                oldSubmission.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json(result);
                });
            }
        });
    });
};

exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Submission.findOne({ slug })
        .select('photo')
        .exec((err, submission) => {
            if (err || !submission) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', submission.photo.contentType);
            return res.send(submission.photo.data);
        });
};

exports.listRelated = (req, res) => {
    // Max 3 related submissions
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    const { _id, categories } = req.body.submission;
    // related mean the same class/category
    Submission.find({ _id: { $ne: _id }, categories: { $in: categories } })
        .limit(limit)
        .populate('postedBy', '_id name username profile')
        .select('title fileID fileName slug excerpt postedBy createdAt updatedAt')
        .exec((err, submissions) => {
            if (err) {
                return res.status(400).json({
                    error: 'Submissions not found'
                });
            }
            res.json(submissions);
        });
};

exports.listSearch = (req, res) => {
    const { search } = req.query;
    if (search) {
        // Search submissions based on title or body
        Submission.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }]
            },
            (err, submissions) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(submissions);
            }
        ).select('-photo -body');
        // ^ get everything but the photo and body
    }
};


exports.listByUser = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let userId = user._id;
        Submission.find({ postedBy: userId })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title fileID fileName slug postedBy createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(data);
            });
    });
};