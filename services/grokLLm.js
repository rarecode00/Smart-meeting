import Groq from "groq-sdk";
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set.");
}

const groq = new Groq({ apiKey });

// Sample meeting transcript for testing your summary generator
export const sampleTranscript = `
Sarah Johnson: Good morning everyone! Thanks for joining today's product planning meeting. Let's get started. We have a lot to cover today.

Mike Chen: Morning! Ready to go.

Emily Rodriguez: Hi everyone, good to see you all.
Sarah Johnson: Alright, so today's agenda includes discussing our Q1 product roadmap, reviewing the user feedback from last month, and making some key decisions about our mobile app redesign. Let's start with the roadmap.

Mike Chen: Perfect. So I've been looking at the analytics and we're seeing a 35% drop-off rate on the checkout page. This is our biggest pain point right now.

user: Emily Rodriguez: Yes, I noticed that too. The user research team conducted interviews with 50 users last week, and the main complaint is that the checkout process has too many steps. They want a one-click checkout option.

user: Sarah Johnson: That's valuable feedback. What do you think about implementing a simplified checkout flow?

user: Mike Chen: I think it's critical. We should prioritize this for Q1. If we can reduce the checkout steps from five to two, we could potentially recover 15-20% of those lost conversions.

user: Sarah Johnson: Agreed. Let's make that decision official - we'll implement a simplified two-step checkout process as our top priority for Q1. Mike, can you lead this initiative?

user: Mike Chen: Absolutely. I'll take ownership of that. I'll need about two weeks to create a detailed implementation plan and coordinate with the engineering team.

user: Emily Rodriguez: I can help with the UX design mockups. I'll have those ready by next Friday.

user: Sarah Johnson: Excellent. Emily, please prepare those mockups by January 12th. Mike, you'll have the implementation plan ready by January 19th. Let's move that forward.

user: Mike Chen: Noted. I'll also need to sync with the backend team about API changes.

user: Sarah Johnson: Good point. Now, let's talk about the mobile app redesign. We've been getting feedback that our app looks outdated compared to competitors.

user: Emily Rodriguez: Yes, I have some concerns about our current design system. It was built three years ago and doesn't follow modern iOS and Android guidelines. I propose we adopt a new design system based on Material Design 3 and Apple's Human Interface Guidelines.

user: Mike Chen: That makes sense, but what's the timeline? A full redesign could take months.

user: Emily Rodriguez: I estimate about 12 weeks for a complete overhaul - 3 weeks for design, 8 weeks for development, and 1 week for QA and testing.

user: Sarah Johnson: That's within our Q1-Q2 timeframe. I think we should approve this. It's important we stay competitive. Let's officially decide to move forward with the mobile app redesign using the new design system.

user: Mike Chen: Agreed. This will also help with our App Store ratings which have been declining.

user: Sarah Johnson: Emily, you'll lead the design phase. Can you create a project timeline and share it with the team?

user: Emily Rodriguez: Yes, I'll create a detailed timeline with milestones and deliverables. I'll have that ready by next Wednesday, January 10th.

user: Sarah Johnson: Perfect. Now, one more important topic - we need to discuss the budget for external contractors. Marketing wants to hire a video production company for product demos.

user: Mike Chen: How much are we talking about?

user: Sarah Johnson: They're requesting $25,000 for a series of five professional product demo videos.

user: Emily Rodriguez: That seems reasonable. Good product videos could significantly improve our conversion rates and social media engagement.

user: Mike Chen: I agree. The ROI on professional video content is usually quite good. I say we approve it.

user: Sarah Johnson: Alright, decision made - we'll approve the $25,000 budget for video production. I'll inform the marketing team and they can proceed with contractor selection.

user: Mike Chen: Should we set any guidelines for the videos?

user: Sarah Johnson: Good point. Emily, can you work with marketing to create a brief outlining our brand guidelines and video requirements?

user: Emily Rodriguez: Sure, I can do that. I'll coordinate with the marketing team and have the creative brief ready by January 15th.

user: Sarah Johnson: Excellent. Let's also quickly discuss our customer support metrics. We've been seeing an increase in support tickets.

user: Mike Chen: Yes, I noticed that. We're averaging about 200 tickets per day now, up from 150 last quarter. Most of them are about password resets and account issues.

user: Emily Rodriguez: Maybe we should implement a better self-service portal? That could reduce the ticket volume significantly.

user: Sarah Johnson: That's a great idea. Let's add that to our roadmap for Q2. For now, let's make sure we have adequate support staffing.

user: Mike Chen: I'll review the support metrics in detail and present recommendations at our next meeting. I'll prepare that analysis by next Monday, January 8th.

user: Sarah Johnson: Great. Is there anything else we need to cover today?

user: Emily Rodriguez: Just one quick thing - the engineering team mentioned they want to upgrade our database infrastructure. It might cause some downtime.

user: Sarah Johnson: How much downtime are we talking about?

user: Mike Chen: They estimated 2-3 hours during off-peak hours. I think we should schedule it for a Sunday morning, maybe January 14th.

user: Sarah Johnson: Okay, let's approve the infrastructure upgrade for January 14th, early morning. Mike, coordinate with engineering to minimize any user impact.

user: Mike Chen: Will do. I'll send out a notification to all users 48 hours in advance.

user: Sarah Johnson: Perfect. Alright team, let's wrap up. To summarize - we've made several important decisions today, assigned clear action items, and have good momentum for Q1. Thanks everyone for your time and great input!

user: Emily Rodriguez: Thanks Sarah! Productive meeting.

user: Mike Chen: Thanks everyone, talk soon!
`;

export async function generateSummary(transcript) {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Latest and most capable
            messages: [
                {
                    role: "system",
                    content: "You are a professional meeting assistant. Extract structured information from meeting transcripts and return valid JSON only."
                },
                {
                    role: "user",
                    content: `From the following conversation transcript, extract:

1. Short overview of the meeting (2–3 sentences)
2. Key decisions taken
3. Action items (with owner if mentioned)
4. Main discussion topics

Return the result strictly in this JSON format (return ONLY valid JSON, no markdown or explanations):

{
    "shortOverview": "",
    "keyDecisions": [],
    "actionItems": [{ "owner": "", "task": "" }],
    "topics": []
}

Transcript:
${transcript}`
                }
            ],
            temperature: 0.2,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        const jsonResponse = JSON.parse(content);
        return jsonResponse;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error(`Failed to generate summary: ${error.message}`);
    }
}
