const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const UserLanguage = new mongoose.Schema(
    {
        LanguageFile: {
            type: String, //cloudinary URL
            required: true,
        },
        LanguageToken: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: Number,
            required: true,
        },
        LanguageCode: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    });

// video Schema
// UserLanguage.plugin(mongooseAggregatePaginate)
exports.UserLanguage = mongoose.model("UserLanguage", UserLanguage)