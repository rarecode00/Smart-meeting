Smart Meeting

Core Features -

1. Video calling, screen share and many more.
2. Live captions
3. Summary of meeting (on demand from user)

Workflow -

1. Home page (render all meeting and create a new meeting)
2. Button to join meeting
3. Loads video components

Additional Meta Data -

1. Meeting Status - Created | inProgress | ended
2. Live joined pariticipant count

Prompt to be used for summarisation -

You are a professional meeting assistant.

From the following conversation transcript, extract:

1. Short overview of the meeting (2–3 sentences)
2. Key decisions taken
3. Action items (with owner if mentioned)
4. Main discussion topics

Return the result strictly in this JSON format:

{
"shortOverview": "",
"keyDecisions": [],
"actionItems": [{ "owner": "", "task": "" }],
"topics": []
}

Transcript:
