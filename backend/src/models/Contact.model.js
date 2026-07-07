import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Contact name is required"],
            trim: true,
            maxlength: 100,
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            unique: true,
            maxlength: 20,
        },
        shopkeeper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Shopkeeper reference is required"],
        },
    },
    {
        timestamps: true,
    }
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
