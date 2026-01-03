import { NextResponse } from "next/server";
import Meeting from "@/model/meeting";
import dbConnect from "../../../lib/db";

export async function GET() {
  await dbConnect();
  const meetings = await Meeting.find({});
  console.log(meetings)
  return NextResponse.json({ meetings });
}

export async function POST(req) {
  await dbConnect();
  console.log("POST /api/meeting called");
  try {
    const body = await req.json();
    const newMeeting = new Meeting(body);
    await newMeeting.save();
    return NextResponse.json({ meeting: newMeeting });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
