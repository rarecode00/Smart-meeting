import dbConnect from "@/lib/db";
import Meeting from "@/model/meeting";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;
    console.log("GET /api/meeting/[id] called with id:", params);
    await dbConnect();
    try {
        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }
        return NextResponse.json({ meeting });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        return NextResponse.json({ error: "Failed to fetch meeting" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    const { id } = await params;
    await dbConnect();
    try {
        const meeting = await Meeting.findById(id);
        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }
        const data = await req.json();
        let dataToUpdate = {};
        // check the action to perform 
        if (data.action === "join") {
            // Logic to join the meeting
            if (meeting.meetStatus === "created") {
                dataToUpdate.actualStartTime = new Date();
                dataToUpdate.meetStatus = "inProgress";
            }
            dataToUpdate.activeParticipantCount = (meeting?.activeParticipantCount || 0) + 1;
        } else if (data.action === "leave") {
            // Logic to leave the meeting
            dataToUpdate.activeParticipantCount = Math.max((meeting?.activeParticipantCount || 1) - 1, 0);
            if (dataToUpdate.activeParticipantCount === 0) {
                dataToUpdate.actualEndTime = new Date();
                dataToUpdate.meetStatus = "ended";
            }
        }
        console.log("Data to update:", dataToUpdate);
        const updatedMeeting = await Meeting.findByIdAndUpdate(id, { $set: dataToUpdate }, { new: true });
        // Update meeting logic would go here
        return NextResponse.json({ meeting: updatedMeeting });
    } catch (error) {
        console.error("Error updating meeting:", error);
        return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
    }
}