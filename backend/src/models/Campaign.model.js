import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
    {
        shopkeeper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        messageTemplate: {
            type: String,
            required: true,
            trim: true,
        },
        imageUrl: {
            type: String,
            trim: true,
            default: null,
        },
        optOutText: {
            type: String,
            default: " Reply STOP to unsubscribe.",
            trim: true,
        },
        sentCount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["queued", "sending", "completed", "failed"],
            default: "queued",
        },
        recipients: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Contact",
            },
        ],
        errors: [
            {
                contact: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Contact",
                },
                message: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
