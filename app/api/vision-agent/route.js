export async function POST(request) {
    const { callId, action, context } = await request.json();

    const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

    if (action === 'start') {
        // Call Python service
        const response = await fetch(`${PYTHON_SERVICE_URL}/agent/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                call_id: callId,
                context: context || []
            })
        });

        const data = await response.json();
        return Response.json(data);
    }

    if (action === 'stop') {
        const response = await fetch(`${PYTHON_SERVICE_URL}/agent/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ call_id: callId })
        });

        const data = await response.json();
        return Response.json(data);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
}