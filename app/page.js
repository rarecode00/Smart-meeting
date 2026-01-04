"use client";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";

export default function Home() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetch("/api/meeting")
      .then((response) => response.json())
      .then((data) => {
        setMeetings(data?.meetings || []);
      })
      .catch((error) => {
        console.error("Error fetching meetings:", error);
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "inProgress":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGenerateSummary = async (meetingId) => {
    try {
      // Update the meeting to show loading state
      setMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting._id === meetingId
            ? { ...meeting, isGeneratingSummary: true, summaryError: null }
            : meeting
        )
      );

      const response = await fetch(`/api/meeting/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meetingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      // Update meeting with summary data
      setMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting._id === meetingId
            ? {
              ...meeting,
              isGeneratingSummary: false,
              summaryGenerated: true,
              summary: data.summary
            }
            : meeting
        )
      );
    } catch (error) {
      console.error("Error generating summary:", error);

      // Update meeting to show error
      setMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting._id === meetingId
            ? {
              ...meeting,
              isGeneratingSummary: false,
              summaryError: error.message
            }
            : meeting
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600 mt-2">
              Manage and join your video conferences
            </p>
          </div>
          <MeetingDialog meeting={meetings[0]} setMeetings={setMeetings} />
        </div>

        {/* Meetings Grid */}
        {meetings.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
            <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No meetings yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first meeting to get started
            </p>
            <MeetingDialog meeting={meetings[0]} setMeetings={setMeetings} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {meeting.title}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(
                          meeting.meetStatus
                        )}`}
                      >
                        {meeting.meetStatus === "inProgress"
                          ? "Live"
                          : meeting.meetStatus === "ended"
                            ? "Ended"
                            : "Scheduled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600" title="Created on">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDate(meeting?.createdAt)}
                    </span>
                  </div>

                  {meeting?.actualStartTime && (
                    <div className="flex items-center gap-2 text-gray-600" title="Meeting Start time">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(meeting?.actualStartTime)}
                      </span>
                    </div>
                  )}

                  {meeting.meetStatus === "inProgress" && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {meeting?.activeParticipantCount ?? 0} active
                        participants
                      </span>
                    </div>
                  )}

                  {/* Show summary if generated */}
                  {/* {meeting.summary && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Summary:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {meeting.summary}
                      </p>
                    </div>
                  )} */}

                  {/* Show error if summary generation failed */}
                  {meeting.summaryError && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-700">
                        Failed to generate summary: {meeting.summaryError}
                      </p>
                    </div>
                  )}
                </div>

                {meeting?.meetStatus !== "ended" ? (
                  <div className="flex gap-3">
                    <a
                      href={`/meeting/${meeting._id}`}
                      target="_blank"
                      className="flex-1"
                    >
                      <Button className="w-full cursor-pointer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Generate Summary Button - Only shown for ended meetings */}
                    {!meeting.summaryGenerated && (
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                        onClick={() => handleGenerateSummary(meeting._id)}
                        disabled={meeting.isGeneratingSummary}
                      >
                        {meeting.isGeneratingSummary ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate Summary
                          </>
                        )}
                      </Button>
                    )}

                    {/* Show view summary button if summary already exists */}
                    {meeting.summaryGenerated && (
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                        onClick={() => {
                          window.open(`/meeting/summary/${meeting._id}`, "_blank");
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Summary
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full cursor-not-allowed"
                      disabled
                    >
                      Meeting Ended
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingDialog({ meeting, setMeetings }) {
  const [open, setOpen] = useState(false);

  const handleCreateMeeting = (e) => {
    e.preventDefault();

    fetch("/api/meeting", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
        setOpen(false);
        // Reset form
        e.target.reset();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Create New Meeting
          </DialogTitle>
          <DialogDescription>
            Schedule a new video conference with your team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateMeeting} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Meeting Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Team Standup, Client Call, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="scheduledStartTime"
                className="text-sm font-medium"
              >
                Start Time
              </label>
              <Input
                id="scheduledStartTime"
                name="scheduledStartTime"
                type="datetime-local"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="scheduledEndTime" className="text-sm font-medium">
                End Time
              </label>
              <Input
                id="scheduledEndTime"
                name="scheduledEndTime"
                type="datetime-local"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}