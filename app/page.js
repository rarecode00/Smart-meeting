"use client";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const meetings = [
  { id: 1, title: "Meeting 1", date: "2024-07-01", meetStatus: "scheduled" },
  { id: 2, title: "Meeting 2", date: "2024-07-02", meetStatus: "scheduled" },
]

export default function Home() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetch('/api/meeting')
      .then((response) => response.json())
      .then((data) => {
        setMeetings(data?.meetings || []);
      })
      .catch((error) => {
        console.error('Error fetching meetings:', error);
      });
  }, []);
  return (
    <div className="bg-gray-50">
      <div className="flex gap-4">
        <p>Meetings</p>
        <MeetingDialog meeting={meetings[0]} setMeetings={setMeetings} />
      </div>
      {meetings.map((meeting) => (
        <div key={meeting._id} className="flex gap-4">
          <h2>{meeting.title}</h2>
          <p>Date: {meeting?.createdAt ? meeting?.createdAt : ''}</p>
          <p>Status: {meeting.meetStatus}</p>
          {meeting?.meetStatus === 'inProgress' && <p>Active Participants: {meeting?.activeParticipantCount ?? 0}</p>}
          {meeting?.meetStatus !== 'ended' && <a href={`/meeting/${meeting._id}`} target="_blank">Join Meeting</a>}
        </div>
      ))
      }
    </div >
  );
}


function MeetingDialog({ meeting, setMeetings }) {
  const [open, setOpen] = useState(false);
  const handleCreateMeeting = (e) => {
    e.preventDefault();
    // Logic to handle meeting creation would go here
    console.log("Creating meeting...");
    console.log(e.target)

    fetch('/api/meeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: e.target.title.value,
        scheduledStartTime: e.target.scheduledStartTime.value,
        scheduledEndTime: e.target.scheduledEndTime.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMeetings((prevMeetings) => [...prevMeetings, data.meeting]);
        // Close the dialog or provide feedback to the user as needed
        setOpen(false);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>Create a meeting</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a meeting</DialogTitle>
          <DialogDescription>
            {/* Form fields for creating a meeting would go here */}
            <form className="flex flex-col gap-4 mt-4" onSubmit={handleCreateMeeting}>
              <label className="block mb-1">Title</label>
              <Input type="text" name="title" placeholder="Meeting Title" required />
              <label className="block mb-1">Scheduled Start Time</label>
              <Input type="datetime-local" name="scheduledStartTime" />
              <label className="block mb-1">Scheduled End Time</label>
              <Input type="datetime-local" name="scheduledEndTime" />
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Create Meeting
              </button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog >
  )
}