import dbConnect from "@/lib/db";
import Meeting from "@/model/meeting";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;
    await dbConnect();
    //  first find the meeting summary from the database
    const meeting = await Meeting.findById(id);
    if (!meeting) {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }
    return NextResponse.json({ summary: meeting.summary || null });
}