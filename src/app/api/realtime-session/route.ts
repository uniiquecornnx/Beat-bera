import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { offer } = await request.json();
        
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not configured in environment variables');
        }

        // Since realtime audio API is not yet publicly available,
        // we'll use the text-to-speech API as a temporary solution
        const session = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: 'alloy',
                input: 'Hello! I am your friendly bear companion. I can understand you through speech recognition and respond with my voice. How can I help you today?'
            })
        });

        const responseText = await session.text();
        console.log('OpenAI API Response:', {
            status: session.status,
            statusText: session.statusText,
            headers: Object.fromEntries(session.headers.entries()),
            body: responseText.substring(0, 100) + '...' // Log only the start of the response
        });

        if (!session.ok) {
            // Check if response is HTML (error page)
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                console.error('Received HTML error page');
                throw new Error('Invalid API response format - received HTML instead of JSON');
            }

            let errorMessage;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error?.message || 'Unknown error from OpenAI API';
            } catch (e) {
                errorMessage = 'Failed to parse error response';
            }
            throw new Error(`OpenAI API error: ${errorMessage}`);
        }

        // For now, we'll create a simple SDP answer that will play the audio
        const sdpAnswer = {
            type: 'answer',
            sdp: `v=0
o=- 1234567890 1 IN IP4 127.0.0.1
s=-
t=0 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:dummy
a=ice-pwd:dummy
a=fingerprint:sha-256 dummy
a=setup:active
a=mid:0
a=sendrecv
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
a=candidate:1 1 UDP 2130706431 127.0.0.1 9 typ host
a=end-of-candidates`
        };
        
        return NextResponse.json({
            answer: sdpAnswer,
            sessionId: 'dummy-session-id'
        });
    } catch (error) {
        console.error('Error in realtime session route:', error);
        return NextResponse.json(
            { 
                error: error instanceof Error ? error.message : 'Failed to initialize voice chat session',
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
} 