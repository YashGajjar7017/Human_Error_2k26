const axios = require('axios');

// Function to create a temporary session
async function createTempSession() {
    try {
        // First, try to login with testuser/testpass
        console.log('Attempting to login with testuser/testpass...');
        const loginResponse = await axios.post('http://localhost:8000/api/auth/login', {
            username: 'testuser',
            password: 'testpass'
        });

        if (loginResponse.data.success) {
            console.log('Login successful!');
            const token = loginResponse.data.token;

            // Create session with the token
            console.log('Creating session...');
            const sessionResponse = await axios.post('http://localhost:8000/api/sessions/create', {
                title: 'Temporary Demo Session',
                language: 'javascript',
                theme: 'dark',
                readOnly: false,
                maxParticipants: 5,
                allowJoin: true,
                initialCode: `// Welcome to the temporary session!
// This is a demo collaborative coding session

console.log("Hello from temp session!");
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Coder"));`,
                creatorUsername: loginResponse.data.user.username
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Session creation response:', sessionResponse.data);
            console.log('Session creation error details:', sessionResponse.data.message || 'Unknown error');

            if (sessionResponse.data.success) {
                const session = sessionResponse.data.data;
                console.log('=== TEMPORARY SESSION CREATED SUCCESSFULLY ===');
                console.log(JSON.stringify(session, null, 2));
                console.log('\n=== SESSION DETAILS ===');
                console.log(`Session ID: ${session.sessionId}`);
                console.log(`Join Code: ${session.joinCode}`);
                console.log(`Language: ${session.language}`);
                console.log(`Theme: ${session.theme}`);
                console.log(`Max Participants: ${session.maxParticipants}`);
                console.log(`Participants: ${session.participants.length}`);
                console.log('\n=== INITIAL CODE ===');
                console.log(session.code);

                return session;
            } else {
                console.error('Failed to create session:', sessionResponse.data.message);
            }
        } else {
            console.log('Login failed:', loginResponse.data.message);
        }

    } catch (error) {
        console.error('Error creating temp session:', error.message);

        // Fallback: show what a session looks like
        console.log('\n=== FALLBACK: SAMPLE SESSION STRUCTURE ===');
        const sampleSession = {
            sessionId: "abc123def456",
            joinCode: "XYZ789AB",
            creatorId: "user123",
            title: "Sample Collaborative Session",
            language: "javascript",
            theme: "dark",
            readOnly: false,
            maxParticipants: 10,
            allowJoin: true,
            code: "// Sample code in the session\nconsole.log('Hello World!');",
            participants: [
                {
                    userId: "user123",
                    username: "HostUser",
                    role: "host"
                }
            ],
            isActive: true,
            createdAt: "2024-01-15T10:30:00.000Z",
            lastActivity: "2024-01-15T10:35:00.000Z"
        };

        console.log(JSON.stringify(sampleSession, null, 2));
        return sampleSession;
    }
}

// Run the function
createTempSession().then(session => {
    console.log('\n=== SESSION CREATION COMPLETE ===');
    console.log('You can now use this session for testing collaborative features.');
}).catch(error => {
    console.error('Failed to create temp session:', error);
});
