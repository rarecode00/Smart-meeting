// creating a meeting model
// Meeting {
//   _id
//   meetLink
//   meetStatus   // created | active | ended
//   actualStartTime
//   actualEndTime
//   participants[]   // optional for MVP
//   scheduledStartTime?   // optional
//   scheduledEndTime?     // optional
// }

// 
import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    meetLink: { type: String },
    meetStatus: {
        type: String,
        enum: ["created", "inProgress", "ended"],
        default: "created",
    },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    activeParticipantCount: { type: Number, default: 0 },
    // participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], //  roadmaps
    scheduledStartTime: { type: Date },
    scheduledEndTime: { type: Date },
    transcriptions: { type: Array, default: [] },
    summary: { type: Object },
    summaryGenerated: { type: Boolean, default: false },
    summaryGeneratedAt: { type: Date },
}, { timestamps: true, versionKey: false });

const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);

export default Meeting;