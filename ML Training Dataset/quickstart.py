"""
Quick Start & Testing Script for AI Code Tester
Demonstrates how to use the trained model and environment.
"""

import sys
import os
import numpy as np
from pathlib import Path

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from envs.code_testing_env import CodeTestingEnv
from models.dqn_agent import DQNAgent
from dataset.dataset_generator import CodeTestingDataset


def quick_test_environment():
    """Quick test of the environment."""
    print("\n" + "="*60)
    print("Testing Code Testing Environment")
    print("="*60)
    
    env = CodeTestingEnv(max_episodes=1)
    
    # Sample code with a bug
    buggy_code = """
def find_index(lst, target):
    for i in range(len(lst)):
        if lst[i] == target:
            return i
    return -1

def process_numbers(numbers):
    result = []
    for i in range(len(numbers) + 1):  # BUG: off-by-one error
        result.append(numbers[i] * 2)
    return result
"""
    
    state = env.reset(buggy_code)
    print(f"\n✓ Environment initialized")
    print(f"State shape: {state.shape}")
    print(f"State values: {state}")
    
    # Take some actions
    total_reward = 0
    for step in range(5):
        action = np.random.randint(0, 6)
        next_state, reward, done, info = env.step(action)
        total_reward += reward
        
        print(f"\nStep {step+1}:")
        print(f"  Action: {action} (strategy: {['edge_case', 'fuzzing', 'type_mismatch', 'overflow', 'logic', 'integration'][action]})")
        print(f"  Reward: {reward}")
        print(f"  Bugs found: {len(info['bugs_found'])}")
        print(f"  Coverage: {info['coverage']:.1f}%")
        
        if done:
            break
    
    print(f"\nTotal Reward: {total_reward}")
    print("✓ Environment test complete!")


def quick_test_dataset():
    """Quick test of dataset generation."""
    print("\n" + "="*60)
    print("Testing Dataset Generation")
    print("="*60)
    
    dataset_gen = CodeTestingDataset(output_dir='dataset')
    
    # Generate small dataset
    print("\nGenerating dataset with 10 samples...")
    dataset = dataset_gen.generate_dataset(num_samples=10)
    
    print(f"✓ Dataset generated")
    print(f"Sample breakdown:")
    
    for i, sample in enumerate(dataset[:3]):
        print(f"\n  Sample {i+1}:")
        print(f"    Bug Type: {sample['bug_type']}")
        print(f"    Difficulty: {sample['difficulty']}")
        print(f"    Complexity: {sample['complexity_score']}")
        print(f"    Code preview: {sample['code'][:60]}...")
    
    # Save dataset
    dataset_gen.save_dataset('test_dataset.json')
    
    # Get statistics
    stats = dataset_gen.generate_statistics()
    print(f"\nDataset Statistics:")
    print(f"  Total Samples: {stats['total_samples']}")
    print(f"  Difficulties: {stats['by_difficulty']}")
    print(f"  Avg Complexity: {stats['avg_complexity']:.2f}")
    
    print("✓ Dataset test complete!")


def quick_test_agent():
    """Quick test of agent creation."""
    print("\n" + "="*60)
    print("Testing DQN Agent")
    print("="*60)
    
    agent = DQNAgent(state_size=5, action_size=6)
    
    print("\n✓ Agent created")
    print(f"  State size: {agent.state_size}")
    print(f"  Action size: {agent.action_size}")
    print(f"  Learning rate: {agent.learning_rate}")
    print(f"  Epsilon: {agent.epsilon}")
    
    # Test action selection
    dummy_state = np.array([10, 5, 20, 0, 0], dtype=np.float32)
    
    print("\nTesting action selection:")
    for i in range(3):
        action = agent.act(dummy_state, training=True)
        print(f"  Action {i+1}: {action}")
    
    # Test memory
    print("\nTesting experience replay memory:")
    for i in range(5):
        next_state = np.array([10, 5, 20, i, 10], dtype=np.float32)
        agent.remember(dummy_state, np.random.randint(0, 6), np.random.rand()*10, next_state, False)
    
    print(f"  Memory size: {len(agent.memory)}")
    
    # Test replay
    if len(agent.memory) > 3:
        loss = agent.replay(batch_size=3)
        print(f"  Training loss: {loss:.4f}")
    
    print("✓ Agent test complete!")


def run_mini_training(num_episodes=5):
    """Run a quick mini training session."""
    print("\n" + "="*60)
    print(f"Running Mini Training ({num_episodes} episodes)")
    print("="*60)
    
    env = CodeTestingEnv(max_episodes=num_episodes)
    agent = DQNAgent(state_size=5, action_size=6)
    dataset_gen = CodeTestingDataset()
    
    # Generate small dataset
    print("\nGenerating training data...")
    dataset = dataset_gen.generate_dataset(num_samples=5)
    
    print("Starting training...\n")
    
    for episode in range(num_episodes):
        code_sample = np.random.choice(dataset)['code']
        state = env.reset(code_sample)
        
        episode_reward = 0
        steps = 0
        
        while steps < 10:
            action = agent.act(state, training=True)
            next_state, reward, done, info = env.step(action)
            
            agent.remember(state, action, reward, next_state, done)
            
            if len(agent.memory) > 5:
                loss = agent.replay(batch_size=4)
            
            episode_reward += reward
            state = next_state
            steps += 1
            
            if done:
                break
        
        agent.decay_epsilon()
        
        print(f"Episode {episode+1}: Reward={episode_reward:.1f}, "
              f"Epsilon={agent.epsilon:.3f}, Memory={len(agent.memory)}")
    
    print("\n✓ Mini training complete!")
    
    # Save model
    os.makedirs('models', exist_ok=True)
    agent.save('models/test_model.h5')
    print("✓ Model saved to models/test_model.h5")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Quick test of AI Code Tester')
    parser.add_argument('--test', type=str, default='all',
                        choices=['all', 'env', 'dataset', 'agent', 'train'],
                        help='Which component to test')
    
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("AI CODE TESTING SYSTEM - Quick Start")
    print("="*60)
    
    if args.test in ['all', 'env']:
        quick_test_environment()
    
    if args.test in ['all', 'dataset']:
        quick_test_dataset()
    
    if args.test in ['all', 'agent']:
        quick_test_agent()
    
    if args.test in ['all', 'train']:
        run_mini_training(num_episodes=3)
    
    print("\n" + "="*60)
    print("✓ All tests complete!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Install dependencies: pip install -r requirements.txt")
    print("  2. Generate dataset: python train.py --generate-dataset --dataset-size 100")
    print("  3. Train agent: python train.py --episodes 100 --agent dqn")
    print("  4. Evaluate agent: python train.py --eval-only --model-path models/your_model.h5")
