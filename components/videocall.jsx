"use client";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  VideoPreview,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function VideoCall({ meeting, userId, callId, setMeeting }) {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  useEffect(() => {
    const initVideoClient = async () => {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const { token, apiKey } = await response.json();

      const user = {
        id: userId,
        name: userId,
      };

      const videoClient = new StreamVideoClient({
        apiKey,
        user,
        token,
      });

      setClient(videoClient);

      // Create the call but DON'T join yet
      const newCall = videoClient.call("default", callId);
      //   await newCall.getOrCreate();
      await newCall.join({ create: true });
      setCall(newCall);
    };

    initVideoClient();

    return () => {
      call?.leave();
      client?.disconnectUser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, callId]);

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <CallUI callId={callId} setMeeting={setMeeting} meeting={meeting} />
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}

// Separate component to use Stream's hooks
function CallUI({ callId, setMeeting, meeting }) {
  const {
    useCallCallingState,
    useIsCallCaptioningInProgress,
    useCallClosedCaptions,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const call = useCall();
  const [showCaptions, setShowCaptions] = useState(false);
  const processedCaptionsRef = useRef(new Set());

  // Access the closed captions (transcriptions)
  const closedCaptions = useCallClosedCaptions();

  // Hanlde meeting leave or join
  async function handleMeeting(body) {
    const res = await fetch(`/api/meeting/${callId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setMeeting(data.meeting);
    }
  }

  // fetch the latest meeting
  async function fetchMeeting() {
    const res = await fetch(`/api/meeting/${callId}`);
    if (!res.ok) {
      setMeeting({});
    } else {
      const data = await res.json();
      setMeeting(data.meeting);
      if (data.meeting?.meetStatus == "inProgress") {
        await handleMeeting({ action: "join" });
      }
    }
  }

  const handleJoin = async () => {
    try {
      if (meeting?.meetStatus === "ended") {
        alert("Meeting has ended. You cannot join.");
        return;
      }
      await fetchMeeting();
      await call?.join();
    } catch (error) {
      console.error("Error joining call:", error);
    }
  };

  const toggleCaptions = async (action) => {
    try {
      if (action === "stop") {
        await call?.stopClosedCaptions();
      } else {
        await call?.startClosedCaptions();
      }
    } catch (error) {
      console.error("Error toggling captions:", error);
    }
  };

  // Automatically start/stop captions based on call state
  useEffect(() => {
    if (callingState === "joined") {
      // Automatically start captions when joined
      toggleCaptions("start");
    } else {
      // Stop captions when not joined
      toggleCaptions("stop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callingState]);

  // output of closed captions to meeting
//   {
//     "id": "994ba9f8-bb10-52bf-b1c3-7ca7d58f3584",
//     "text": "Hello Krishna this side",
//     "start_time": "2026-01-03T19:08:20.392081737Z",
//     "end_time": "2026-01-03T19:08:24.292081832Z",
//     "speaker_id": "user-1-72718",
//     "user": {
//         "id": "user-1-72718",
//         "name": "user-1-72718",
//         "custom": {},
//         "language": "",
//         "role": "user",
//         "teams": [],
//         "created_at": "2026-01-03T19:07:53.538818Z",
//         "updated_at": "2026-01-03T19:07:53.540142Z",
//         "banned": false,
//         "online": true,
//         "blocked_user_ids": []
//     },
//     "language": "en",
//     "service": "stream",
//     "translated": false
// }

  // append the transcriptions to meeting 
    useEffect(() => {
    if (!closedCaptions || closedCaptions.length === 0) return;

    // Filter out already processed captions
    const newCaptions = closedCaptions?.filter(
      caption => !processedCaptionsRef?.current?.has(caption?.id)
    );

    if (newCaptions.length === 0) return;

    // Send in background without blocking UI
    const sendTranscriptions = async () => {
      try {
        // Send all new captions in a single batch request
        const res = await fetch('/api/meeting/transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meetingId: callId,
            transcriptions: newCaptions?.map(caption => ({
              id: caption?.id,
              text: caption?.text,
              speaker_id: caption?.speaker_id,
              speaker_name: caption?.user?.name || 'Unknown',
              start_time: caption?.start_time,
              end_time: caption?.end_time,
            })),
          }),
        });

        if (res.ok) {
          // Mark as processed only if successful
          newCaptions?.forEach(caption => 
            processedCaptionsRef.current.add(caption.id)
          );
        } else {
          console.error('Failed to add transcriptions to meeting');
        }
      } catch (error) {
        console.error('Error sending transcriptions:', error);
      }
    };

    // Fire and forget - runs in background
    sendTranscriptions();

  }, [closedCaptions, callId]);

  if (callingState !== "joined") {
    return <LobbyView onJoin={handleJoin} />;
  }  



  return (
    <div className="h-screen relative">
      <SpeakerLayout />

      {/* Live Captions Display */}
      {showCaptions && closedCaptions && closedCaptions?.length > 0 && (
        <div className="absolute bottom-24 left-0 right-0 px-4 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-4xl mx-auto">
            {closedCaptions?.map(({ user, text, start_time }) => (
              <div
                key={`${user.id}-${start_time}`}
                className="mb-2 last:mb-0"
              >
                <span className="font-semibold text-blue-300">
                  {user.name}:
                </span>{" "}
                <span className="text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Controls with Caption Toggle */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/50">
        <div className="flex items-center justify-center gap-4">
          <CallControls onLeave={() => handleMeeting({ action: "leave" })} />
          <Button
            onClick={() => setShowCaptions(!showCaptions)}
            variant={showCaptions ? "default" : "secondary"}
            size="lg"
            className="min-w-30"
          >
            {showCaptions ? "🔊 CC On" : "🔇 CC Off"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LobbyView({ onJoin }) {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { optimisticIsMute: isMicMuted } = useMicrophoneState();
  const { optimisticIsMute: isCameraMuted } = useCameraState();
  const call = useCall();

  const toggleCamera = async () => {
    try {
      if (isCameraMuted) {
        await call?.camera.enable();
      } else {
        await call?.camera.disable();
      }
    } catch (error) {
      console.error("Error toggling camera:", error);
    }
  };

  const toggleMic = async () => {
    try {
      if (isMicMuted) {
        await call?.microphone.enable();
      } else {
        await call?.microphone.disable();
      }
    } catch (error) {
      console.error("Error toggling mic:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Ready to join?</h2>

        <div className="mb-6 rounded-lg overflow-hidden bg-gray-900 aspect-video">
          <VideoPreview />
        </div>

        <div className="flex gap-4 justify-center mb-6">
          <Button
            onClick={toggleMic}
            variant={isMicMuted ? "destructive" : "default"}
            size="lg"
          >
            {isMicMuted ? "🎤 Mic Off" : "🎤 Mic On"}
          </Button>
          <Button
            onClick={toggleCamera}
            variant={isCameraMuted ? "destructive" : "default"}
            size="lg"
          >
            {isCameraMuted ? "📷 Camera Off" : "📷 Camera On"}
          </Button>
        </div>

        <Button onClick={onJoin} className="w-full" size="lg">
          Join Meeting
        </Button>
      </div>
    </div>
  );
}