# AI Code Testing System - Reinforcement Learning Model

Complete RL system for automated code testing with synthetic bug detection and test case generation.

## 📁 Structure

```
AI_CodeTester/
├── envs/
│   └── code_testing_env.py          # RL Environment (OpenAI Gym)
├── models/
│   ├── dqn_agent.py                 # DQN & Policy Gradient agents
│   └── *.h5                         # Trained model files
├── dataset/
│   ├── dataset_generator.py         # Synthetic dataset generation
│   └── *.json                       # Dataset files
├── train.py                         # Training script
├── quickstart.py                    # Quick test & demo
├── requirements.txt                 # Dependencies
└── README.md                        # This file
```

## 🎯 System Overview

### RL Environment (`code_testing_env.py`)
- **State Space**: [code_complexity, num_functions, num_variables, bugs_found, coverage]
- **Action Space**: 6 testing strategies
  - 0: Edge case testing (boundary values)
  - 1: Random input testing (fuzzing)
  - 2: Type mismatch testing
  - 3: Overflow/underflow testing
  - 4: Logic path testing
  - 5: Integration testing
  
- **Rewards**:
  - +10: Found a bug
  - +5: Improved test coverage
  - +2: Executed test case
  - -1: Redundant test
  - -5: Invalid test
  - -10: Timeout/crash

### Agents (`models/dqn_agent.py`)
1. **DQN Agent**: Deep Q-Network with experience replay
   - 3 hidden layers (128, 128, 64 neurons)
   - Batch normalization & dropout
   - Target network for stability
   
2. **Policy Gradient Agent**: Actor-Critic architecture
   - Actor network (policy): outputs action probabilities
   - Critic network (value): estimates expected return

### Dataset Generator (`dataset/dataset_generator.py`)
Generates 10+ types of synthetic code with known bugs:
- Infinite loops
- Off-by-one errors
- Division by zero
- Null pointers
- Type mismatches
- Logic errors
- Memory leaks
- Race conditions
- Regex errors
- SQL injection

Each sample includes:
- Code with bug
- Bug type and severity
- Test cases
- Expected output
- Complexity score

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Quick Tests
```bash
python quickstart.py
# Or test specific components:
python quickstart.py --test env
python quickstart.py --test dataset
python quickstart.py --test agent
python quickstart.py --test train
```

### 3. Generate Dataset
```bash
python train.py --generate-dataset --dataset-size 100
```

### 4. Train Agent
```bash
# DQN agent (recommended)
python train.py --episodes 100 --agent dqn

# Or Policy Gradient agent
python train.py --episodes 100 --agent policy_gradient

# With custom batch size
python train.py --episodes 50 --batch-size 16
```

### 5. Evaluate Trained Model
```bash
python train.py --eval-only --model-path models/code_tester_dqn_20231214_120000.h5
```

## 📊 Output

Training produces:
- **Model File**: `models/code_tester_{agent}_{timestamp}.h5`
- **Training History**: `models/code_tester_{agent}_{timestamp}_history.json`
- **Performance Plot**: `models/training_{agent}_{timestamp}.png`

## 💡 Example: Using Trained Agent

```python
from AI_CodeTester import CodeTestingEnv, DQNAgent

# Load environment and agent
env = CodeTestingEnv()
agent = DQNAgent()
agent.load('models/code_tester_dqn.h5')

# Test code
buggy_code = """
def divide(a, b):
    return a / b
"""

state = env.reset(buggy_code)

# Run agent
for step in range(10):
    action = agent.act(state, training=False)  # Greedy policy
    next_state, reward, done, info = env.step(action)
    
    print(f"Step {step+1}: Action={action}, Reward={reward}, Bugs={len(info['bugs_found'])}")
    
    if done:
        break
```

## 🧠 Training Details

### DQN Hyperparameters
- Learning rate: 0.001
- Gamma (discount): 0.95
- Initial epsilon: 1.0
- Epsilon decay: 0.995
- Replay buffer size: 2000
- Batch size: 32
- Target update frequency: 10 episodes

### Training Metrics
The system tracks:
- Episode reward (cumulative)
- Loss (MSE on Q-values)
- Epsilon (exploration rate)
- Bugs found per episode
- Test coverage %

## 📈 Expected Performance

After 100 episodes of training:
- Avg reward per episode: ~50-150 (depending on difficulty)
- Bug detection rate: 60-80%
- Average test coverage: 70-85%
- Memory efficiency: ~100-500MB

## 🔧 Customization

### Add New Bug Types
Edit `dataset/dataset_generator.py`:
```python
BUG_TEMPLATES = {
    'your_bug_type': {
        'code': '...',
        'bugs': [...],
        'test_cases': [...],
        'expected_output': '...'
    },
    # ... more templates
}
```

### Modify RL Environment
Edit `envs/code_testing_env.py`:
- Change state features in `_get_state()`
- Add/modify actions in `_generate_test_cases()`
- Adjust rewards in `step()`

### Tweak Agent Architecture
Edit `models/dqn_agent.py`:
- Change network layers in `_build_model()`
- Adjust learning parameters in `__init__()`

## ⚠️ Limitations & Notes

1. **Execution Safety**: Code execution uses timeouts and subprocess isolation, but:
   - Not sandbox-safe for truly untrusted code
   - For production, use Docker/gVisor/Firecracker
   
2. **Bug Detection**: Uses heuristics + test execution:
   - May miss complex semantic bugs
   - Works best with clear runtime errors
   
3. **Dataset**: Synthetic samples are simplified:
   - Real-world code patterns more complex
   - Transfer learning may be needed
   
4. **Performance**: 
   - Slower on CPU (GPU recommended for TensorFlow)
   - Max execution timeout: 5-10 seconds per test

## 📝 Future Improvements

- [ ] Integrate with real code repositories (GitHub)
- [ ] Add support for compiled languages (C++, Rust)
- [ ] Implement attention mechanisms for code understanding
- [ ] Multi-agent collaboration for complex testing
- [ ] Integration with IDE plugins
- [ ] Real-time test generation during development

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Areas:
- New bug types/test strategies
- Architecture improvements
- Performance optimizations
- Real-world dataset curation
