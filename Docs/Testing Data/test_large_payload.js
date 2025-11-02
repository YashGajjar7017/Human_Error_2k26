const axios = require('axios');

// Generate a large JSON payload (about 5MB)
const generateLargePayload = (sizeInMB) => {
    const data = [];
    const itemSize = 1000; // approximate size per item
    const numItems = Math.floor((sizeInMB * 1024 * 1024) / itemSize);

    for (let i = 0; i < numItems; i++) {
        data.push({
            id: i,
            name: `Item ${i}`,
            description: 'A'.repeat(500), // 500 chars
            timestamp: new Date().toISOString(),
            metadata: {
                category: 'test',
                tags: ['large', 'payload', 'test'],
                nested: {
                    level1: {
                        level2: 'deep nested data'
                    }
                }
            }
        });
    }

    return { data, totalItems: numItems };
};

const testLargePayload = async () => {
    try {
        const payload = generateLargePayload(5); // 5MB payload
        console.log(`Sending payload with ${payload.totalItems} items (~5MB)`);

        const response = await axios.post('http://localhost:8000/api/auth/login', payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });

        console.log('✅ Large payload test successful');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);

    } catch (error) {
        console.error('❌ Large payload test failed');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error('❌ Request timed out - this indicates the payload limit fix may not be working');
        }
    }
};

const testNormalPayload = async () => {
    try {
        const payload = { username: 'test123', password: 'test123' };
        console.log('Sending normal payload');

        const response = await axios.post('http://localhost:8000/api/auth/login', payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Normal payload test successful');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);

    } catch (error) {
        console.error('❌ Normal payload test failed');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
};

// Run tests
const runTests = async () => {
    console.log('🧪 Starting payload tests...\n');

    // Test normal payload first
    await testNormalPayload();
    console.log('\n' + '='.repeat(50) + '\n');

    // Test large payload
    await testLargePayload();
};

runTests();
