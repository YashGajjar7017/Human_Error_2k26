# TODO: AI Reinforcement Learning Model for Coding Testing

## Overview
Create a reinforcement learning (RL) model for automated coding testing, including a custom Gym environment, RL agent, training dataset, and training script.

## Tasks
- [x] Create `rl_code_testing_env.py`: Custom OpenAI Gym environment for code testing
- [x] Create `rl_code_testing_model.py`: RL model implementation (DQN agent)
- [x] Create `training_dataset.py`: Dataset generation and loading for code testing scenarios
- [x] Create `train_rl_model.py`: Script to train the RL model
- [x] Install required dependencies (gym, tensorflow, numpy, pandas)
- [x] Train the RL model and evaluate performance
- [x] Test the model on sample code snippets

## Summary
✅ **AI Reinforcement Learning Model for Coding Testing Complete**

- **RL Environment**: Custom Gym environment that executes Python code with different inputs and provides rewards based on outcomes (crashes, correct outputs, etc.)
- **DQN Agent**: Deep Q-Network implementation with experience replay and epsilon-greedy exploration
- **Training Dataset**: 5 diverse code testing scenarios including arithmetic functions, error handling, and string operations
- **Training Script**: Complete training pipeline with evaluation and visualization
- **Dependencies**: All required packages installed (numpy, tensorflow, gym, matplotlib)

The model learns to select optimal test inputs to maximize rewards for finding bugs and validating correct behavior in code.

## Files Created
- `ML Training Dataset/rl_code_testing_env.py`
- `ML Training Dataset/rl_code_testing_model.py`
- `ML Training Dataset/training_dataset.py`
- `ML Training Dataset/train_rl_model.py`

## Dependencies
- [x] gym
- [x] tensorflow
- [x] numpy
- [x] pandas
- [x] matplotlib
- [x] MS-Torjan
- subprocess (for code execution)
