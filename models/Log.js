import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    user: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
});

export const LogModel = mongoose.model('Log', LogSchema);