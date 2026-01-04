import dbConnect from "@/lib/db";
import Meeting from "@/model/meeting";
import { generateSummary } from "@/services/grokLLm";
import { NextResponse } from "next/server";

// This is the route to generate meeting summary
// gather the transcript from the meeting model
// send the transcript to Gemini LLM service to generate summary
// save the summary back to the meeting model
export async function POST(req, res) {
    const body = await req.json();
    const { meetingId } = body;
    await dbConnect();
    //  first find the meeting summary from the database
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
        return new Response(JSON.stringify({ error: "Meeting not found" }), { status: 404 });
    }

    // check the transcriptions array exits
    if (!meeting.transcriptions || meeting.transcriptions.length === 0) {
        return new Response(JSON.stringify({ error: "No transcriptions found for this meeting" }), { status: 400 });
    }

    // combine all the transcriptions into a single string
    // speaker_name to text
    const transcript = meeting.transcriptions?.map(t => `${t?.speaker_name}: ${t?.text}`)?.join("\n");

    // send the transcript to Gemini LLM service to generate summary
    const summary = await generateSummary(transcript);

    const updatedMeeting = await Meeting.findByIdAndUpdate(
        meetingId,
        { summary, summaryGenerated: true, summaryGeneratedAt: new Date() },
        { new: true }
    );

    return NextResponse.json({ summary: updatedMeeting.summary });
}