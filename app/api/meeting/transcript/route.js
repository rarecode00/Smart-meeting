import dbConnect from "@/lib/db";
import Meeting from "@/model/meeting";
import { NextResponse } from "next/server";
// API route to add transcriptions to a meeting
export async function POST(req, res) {
    const body = await req.json();
    const { meetingId, transcriptions } = body;

    if (!meetingId || !transcriptions || !Array.isArray(transcriptions)) {
        return res.status(400).json({
            error: "meetingId and transcriptions array are required"
        });
    }

    await dbConnect();

    try {
        const meeting = await Meeting.findByIdAndUpdate(
            meetingId,
            { $push: { transcriptions: { $each: transcriptions } } },
            { new: true, runValidators: true }
        );

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        return NextResponse.json({ meeting });
    } catch (error) {
        console.error("Error adding transcriptions:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}