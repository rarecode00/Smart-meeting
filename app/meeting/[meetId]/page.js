'use client';
import { Button } from '@/components/ui/button';
import VideoCall from '@/components/videocall';
import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function MeetingPage({ params }) {
    const resolvedParams = use(params);
    const [meeting, setMeeting] = useState({});
    const [notfound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);
    async function handleMeeting(body) {
        const res = await fetch(`/api/meeting/${resolvedParams.meetId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const data = await res.json();
            setMeeting(data.meeting);
        }
    }

    useEffect(() => {
        async function fetchMeeting() {
            const res = await fetch(`/api/meeting/${resolvedParams.meetId}`);
            if (!res.ok) {
                setNotFound(true);
                setLoading(false);
                return;
            }
            const data = await res.json();
            setMeeting(data.meeting);
            setLoading(false);
            // trigger join action
            handleMeeting({ action: 'join' });
        }
        fetchMeeting();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedParams?.meetId]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Make API call here
            navigator.sendBeacon(`/api/meeting/${resolvedParams.meetId}`, JSON.stringify({
                action: 'leave'
            }));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [resolvedParams?.meetId]);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (notfound) {
        return notFound();
    }

    if (meeting?.meetStatus === 'ended') {
        return <div>The meeting has ended.</div>;
    }
    // Generate a unique user ID for the video call    
    // user-{count}-{timestamp (only take time portion)}
    let userId = ``;
    if (sessionStorage.getItem('userId')) {
        userId = sessionStorage.getItem('userId');
    } else {
        userId = `user-${meeting?.activeParticipantCount}-${Date.now().toString().slice(-5)}`;
    }
    sessionStorage.setItem('userId', userId);
    return (
        <div>
            {/* <h1>Meeting ID: {resolvedParams.meetId}</h1>
            <h2>Title: {meeting.title}</h2>
            <Button onClick={() => handleMeeting({ action: 'leave' })}>End Meeting</Button> */}
            <VideoCall userId={userId} callId={resolvedParams.meetId} meeting={meeting} setMeeting={setMeeting} />
        </div>
    );
}