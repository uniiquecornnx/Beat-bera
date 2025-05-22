import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import https from 'https';
import http from 'http';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Custom error types
class OpenAIError extends Error {
    constructor(message: string, public type: string, public details?: any) {
        super(message);
        this.name = 'OpenAIError';
    }
}

// Validate API key format
function validateApiKey(apiKey: string | undefined): boolean {
    if (!apiKey) return false;
    
    // Log the first few characters of the key for debugging (safely)
    const keyPrefix = apiKey.substring(0, 5);
    console.log('API Key prefix:', keyPrefix);
    console.log('API Key length:', apiKey.length);
    
    // More lenient validation
    return apiKey.startsWith('sk-') && apiKey.length >= 40;
}

// Configure OpenAI with custom agent and timeout
const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key present:', !!apiKey);
console.log('API Key format valid:', validateApiKey(apiKey));

// Create a custom HTTPS agent with proxy support
const createHttpsAgent = () => {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    
    if (proxyUrl) {
        console.log('Using proxy:', proxyUrl);
        return new HttpsProxyAgent(proxyUrl);
    }
    
    return new https.Agent({
        keepAlive: true,
        timeout: 30000,
        rejectUnauthorized: false, // Only use this in development
        maxSockets: 50, // Increase max sockets
        maxFreeSockets: 10, // Keep more sockets alive
        scheduling: 'fifo' // First in, first out scheduling
    });
};

const openai = new OpenAI({
    apiKey: apiKey,
    maxRetries: 3,
    timeout: 30000,
    httpAgent: createHttpsAgent()
});

// Helper function to identify error type
function identifyError(error: any): OpenAIError {
    console.log('Raw error:', error);

    // Check for API key related errors
    if (error.message?.includes('api_key') || error.message?.includes('authentication')) {
        return new OpenAIError(
            'API key error. Please check your OpenAI API key configuration.',
            'AUTH_ERROR',
            { 
                message: error.message,
                code: error.code
            }
        );
    }

    // Check for network-related errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        return new OpenAIError(
            'Network connection error. The connection was reset. This might be due to network issues or firewall settings.',
            'NETWORK_ERROR',
            { 
                code: error.code,
                message: error.message,
                cause: error.cause,
                suggestion: 'Try using a VPN or check your firewall settings.'
            }
        );
    }

    // Check for API-specific errors
    if (error.response?.status) {
        switch (error.response.status) {
            case 401:
                return new OpenAIError(
                    'Invalid API key or authentication error. Please check your OpenAI API key.',
                    'AUTH_ERROR',
                    { status: error.response.status }
                );
            case 429:
                return new OpenAIError(
                    'Rate limit exceeded. Please try again in a few minutes.',
                    'RATE_LIMIT_ERROR',
                    { status: error.response.status }
                );
            case 500:
            case 502:
            case 503:
            case 504:
                return new OpenAIError(
                    'OpenAI service is currently experiencing issues. Please try again later.',
                    'SERVICE_ERROR',
                    { status: error.response.status }
                );
            default:
                return new OpenAIError(
                    `OpenAI API error: ${error.message}`,
                    'API_ERROR',
                    { status: error.response.status }
                );
        }
    }

    // Check for subscription-related errors
    if (error.message?.includes('insufficient_quota') || error.message?.includes('billing')) {
        return new OpenAIError(
            'Your OpenAI subscription has insufficient quota or billing issues. Please check your account status.',
            'SUBSCRIPTION_ERROR',
            { message: error.message }
        );
    }

    // Check for model-specific errors
    if (error.message?.includes('model_not_found') || error.message?.includes('model_not_available')) {
        return new OpenAIError(
            'The requested model is not available. Please check your API access.',
            'MODEL_ERROR',
            { message: error.message }
        );
    }

    // Default error
    return new OpenAIError(
        'An unexpected error occurred while processing your request.',
        'UNKNOWN_ERROR',
        { 
            error,
            message: error.message,
            code: error.code,
            cause: error.cause
        }
    );
}

// Helper function to retry API calls with exponential backoff
async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            const identifiedError = identifyError(error);
            lastError = identifiedError;
            
            console.log(`Attempt ${attempt} failed:`, {
                error: identifiedError.message,
                type: identifiedError.type,
                details: identifiedError.details
            });
            
            // Don't retry for certain error types
            if (['AUTH_ERROR', 'SUBSCRIPTION_ERROR', 'MODEL_ERROR'].includes(identifiedError.type)) {
                throw identifiedError;
            }
            
            if (attempt < maxRetries) {
                // Exponential backoff with jitter
                const delay = initialDelay * Math.pow(2, attempt - 1) * (0.5 + Math.random());
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

export async function POST(request: Request) {
    try {
        // Validate API key at the start of each request
        if (!apiKey) {
            throw new OpenAIError(
                'OpenAI API key is not configured in environment variables.',
                'CONFIG_ERROR'
            );
        }

        if (!validateApiKey(apiKey)) {
            throw new OpenAIError(
                'OpenAI API key format is invalid.',
                'CONFIG_ERROR'
            );
        }

        const { offer, audioData, mimeType } = await request.json();
        
        // If we have audio data, process it with OpenAI
        if (audioData) {
            try {
                console.log('Processing audio data...');
                
                if (!audioData || typeof audioData !== 'string') {
                    throw new OpenAIError(
                        'Invalid audio data received',
                        'VALIDATION_ERROR'
                    );
                }

                // Convert base64 to buffer
                const audioBuffer = Buffer.from(audioData, 'base64');
                console.log('Audio buffer size:', audioBuffer.length, 'bytes');

                if (audioBuffer.length === 0) {
                    throw new OpenAIError(
                        'Empty audio buffer',
                        'VALIDATION_ERROR'
                    );
                }
                
                // Create a temporary file from the buffer with the correct MIME type
                const audioFile = new File([audioBuffer], 'audio.webm', { type: mimeType || 'audio/webm' });
                console.log('Created audio file with type:', audioFile.type);

                // Test API connection before making the actual request
                try {
                    console.log('Testing API connection...');
                    await openai.models.list();
                    console.log('API connection successful');
                } catch (error) {
                    console.error('API connection test failed:', error);
                    throw new OpenAIError(
                        'Failed to connect to OpenAI API. Please check your API key and internet connection.',
                        'API_ERROR',
                        { error }
                    );
                }

                // Convert audio data to text using OpenAI's Whisper API with retry logic
                console.log('Transcribing audio...');
                const transcription = await retryOperation(async () => {
                    try {
                        return await openai.audio.transcriptions.create({
                            file: audioFile,
                            model: "whisper-1",
                        });
                    } catch (error) {
                        console.error('Transcription error:', error);
                        throw error;
                    }
                });

                if (!transcription.text) {
                    throw new OpenAIError(
                        'No transcription received from Whisper API',
                        'API_ERROR'
                    );
                }

                console.log('Transcription:', transcription.text);

                // Get response from GPT-4 with retry logic
                console.log('Generating response...');
                const completion = await retryOperation(async () => {
                    return await openai.chat.completions.create({
                        model: "gpt-4",
                        messages: [
                            {
                                role: "system",
                                content: "You are a cute and friendly virtual bear. You speak in a warm, playful manner and love interacting with your friend. Keep responses brief and engaging."
                            },
                            {
                                role: "user",
                                content: transcription.text
                            }
                        ],
                    });
                });

                const response = completion.choices[0].message.content;
                if (!response) {
                    throw new OpenAIError(
                        'No response generated from GPT',
                        'API_ERROR'
                    );
                }

                console.log('GPT Response:', response);

                // Convert response to speech with retry logic
                console.log('Converting to speech...');
                const speech = await retryOperation(async () => {
                    return await openai.audio.speech.create({
                        model: "tts-1",
                        voice: "alloy",
                        input: response,
                    });
                });

                // Convert the response to base64
                const audioResponse = await speech.arrayBuffer();
                const base64Response = Buffer.from(audioResponse).toString('base64');

                if (!base64Response) {
                    throw new OpenAIError(
                        'Failed to convert speech to base64',
                        'PROCESSING_ERROR'
                    );
                }

                // Return the audio response
                return NextResponse.json({
                    audioResponse: base64Response,
                    textResponse: response
                });
            } catch (error) {
                const identifiedError = identifyError(error);
                console.error('Error processing audio:', {
                    message: identifiedError.message,
                    type: identifiedError.type,
                    details: identifiedError.details
                });
                
                return NextResponse.json(
                    { 
                        error: identifiedError.message,
                        type: identifiedError.type,
                        details: identifiedError.details
                    },
                    { status: 500 }
                );
            }
        }

        // Initial connection setup
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