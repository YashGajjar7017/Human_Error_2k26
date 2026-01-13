// Challenges Routes
// Code challenges and gamification

const express = require('express');
const router = express.Router();

// In-memory storage for demo
const challenges = new Map();
const userProgress = new Map();

// Sample challenges
const sampleChallenges = [
    {
        id: 'binary-search',
        title: 'Binary Search',
        description: 'Implement an efficient binary search algorithm',
        difficulty: 'easy',
        category: 'algorithms',
        points: 100,
        starterCode: {
            javascript: `function binarySearch(arr, target) {
  // Your code here
}`,
            python: `def binary_search(arr, target):
    # Your code here
    pass`
        },
        testCases: [
            { input: [[1, 2, 3, 4, 5], 3], expected: 2 },
            { input: [[1, 2, 3, 4, 5], 6], expected: -1 },
            { input: [[], 1], expected: -1 }
        ],
        hints: [
            'Remember to check if the array is empty',
            'Compare the middle element with the target',
            'Narrow down the search range'
        ],
        timeLimit: 30000,
        attempts: 0,
        completions: 1524
    },
    {
        id: 'reverse-string',
        title: 'Reverse String',
        description: 'Write a function to reverse a string',
        difficulty: 'easy',
        category: 'strings',
        points: 50,
        starterCode: {
            javascript: `function reverseString(str) {
  // Your code here
}`,
            python: `def reverse_string(str):
    # Your code here
    pass`
        },
        testCases: [
            { input: ['hello'], expected: 'olleh' },
            { input: ['A'], expected: 'A' },
            { input: [''], expected: '' }
        ],
        hints: [
            'You can convert string to array',
            'Think about two-pointer technique'
        ],
        timeLimit: 15000,
        attempts: 0,
        completions: 3421
    },
    {
        id: 'linked-list-cycle',
        title: 'Linked List Cycle Detection',
        description: 'Detect if a linked list has a cycle',
        difficulty: 'medium',
        category: 'data-structures',
        points: 200,
        starterCode: {
            javascript: `function hasCycle(head) {
  // Your code here
}`,
            python: `def has_cycle(head):
    # Your code here
    pass`
        },
        testCases: [],
        hints: [
            'Use Floyd\'s cycle finding algorithm',
            'Fast and slow pointer technique'
        ],
        timeLimit: 45000,
        attempts: 0,
        completions: 876
    },
    {
        id: 'two-sum',
        title: 'Two Sum',
        description: 'Find two numbers that add up to a target',
        difficulty: 'easy',
        category: 'arrays',
        points: 75,
        starterCode: {
            javascript: `function twoSum(nums, target) {
  // Your code here
}`,
            python: `def two_sum(nums, target):
    # Your code here
    pass`
        },
        testCases: [
            { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { input: [[3, 2, 4], 6], expected: [1, 2] },
            { input: [[3, 3], 6], expected: [0, 1] }
        ],
        hints: [
            'Use a hash map for O(n) solution',
            'For each element, check if complement exists'
        ],
        timeLimit: 20000,
        attempts: 0,
        completions: 4521
    },
    {
        id: 'merge-intervals',
        title: 'Merge Intervals',
        description: 'Merge overlapping intervals',
        difficulty: 'hard',
        category: 'algorithms',
        points: 350,
        starterCode: {
            javascript: `function mergeIntervals(intervals) {
  // Your code here
}`,
            python: `def merge_intervals(intervals):
    # Your code here
    pass`
        },
        testCases: [
            { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
            { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] }
        ],
        hints: [
            'Sort intervals by start time',
            'Merge overlapping intervals sequentially'
        ],
        timeLimit: 60000,
        attempts: 0,
        completions: 432
    }
];

// Initialize sample challenges
sampleChallenges.forEach(c => challenges.set(c.id, c));

// Get all challenges
router.get('/', async (req, res) => {
    try {
        const { category, difficulty, limit = 20, offset = 0 } = req.query;
        
        let result = Array.from(challenges.values());
        
        if (category) {
            result = result.filter(c => c.category === category);
        }
        if (difficulty) {
            result = result.filter(c => c.difficulty === difficulty);
        }
        
        res.json({
            success: true,
            data: result.slice(offset, offset + parseInt(limit)),
            total: result.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get challenge by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = challenges.get(id);
        
        if (!challenge) {
            return res.status(404).json({ success: false, error: 'Challenge not found' });
        }
        
        res.json({ success: true, data: challenge });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit challenge solution
router.post('/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language, userId } = req.body;
        
        const challenge = challenges.get(id);
        if (!challenge) {
            return res.status(404).json({ success: false, error: 'Challenge not found' });
        }
        
        // Simulate test execution
        const passed = Math.random() > 0.3; // 70% pass rate for demo
        const executionTime = Math.floor(Math.random() * 100) + 10;
        
        const result = {
            success: true,
            passed: passed,
            score: passed ? challenge.points : Math.floor(challenge.points * 0.3),
            executionTime: executionTime,
            message: passed ? 'All tests passed!' : 'Some tests failed',
            hints: passed ? [] : challenge.hints.slice(0, 1)
        };
        
        // Update challenge stats
        challenge.attempts++;
        if (passed) {
            challenge.completions++;
        }
        
        // Update user progress
        if (userId) {
            const progress = userProgress.get(userId) || {
                completed: [],
                totalPoints: 0,
                streak: 0
            };
            
            if (passed && !progress.completed.includes(id)) {
                progress.completed.push(id);
                progress.totalPoints += result.score;
            }
            userProgress.set(userId, progress);
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user progress
router.get('/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = userProgress.get(userId) || {
            completed: [],
            totalPoints: 0,
            streak: 0,
            level: 1
        };
        
        // Calculate level (100 points per level)
        progress.level = Math.floor(progress.totalPoints / 100) + 1;
        
        res.json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get challenge categories
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = [...new Set(Array.from(challenges.values()).map(c => c.category))];
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

