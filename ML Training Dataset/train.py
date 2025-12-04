"""
Training Script for AI Code Testing Agent
Trains DQN agent on the code testing environment.
"""

import sys
import os
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from envs.code_testing_env import CodeTestingEnv
from models.dqn_agent import DQNAgent, PolicyGradientAgent
from dataset.dataset_generator import CodeTestingDataset


def train_dqn_agent(
    num_episodes: int = 100,
    agent_type: str = 'dqn',
    batch_size: int = 32,
    update_target_freq: int = 10,
    use_dataset: bool = True
) -> Dict:
    """
    Train DQN agent for code testing.
    
    Args:
        num_episodes: Number of training episodes
        agent_type: 'dqn' or 'policy_gradient'
        batch_size: Batch size for experience replay
        update_target_freq: Frequency to update target network
        use_dataset: Use generated dataset for training
    
    Returns:
        Training history and metrics
    """
    
    print(f"\n{'='*60}")
    print(f"Training {agent_type.upper()} Agent for Code Testing")
    print(f"{'='*60}")
    
    # Initialize environment
    env = CodeTestingEnv(max_episodes=num_episodes, timeout=5)
    
    # Initialize agent
    if agent_type == 'dqn':
        agent = DQNAgent(
            state_size=5,
            action_size=6,
            learning_rate=0.001,
            gamma=0.95,
            epsilon=1.0,
            epsilon_decay=0.995,
            memory_size=2000
        )
    else:
        agent = PolicyGradientAgent(state_size=5, action_size=6)
    
    # Load or generate dataset
    dataset_gen = CodeTestingDataset(output_dir='dataset')
    if use_dataset:
        try:
            dataset = dataset_gen.load_dataset('coding_dataset.json')
            print(f"✓ Loaded dataset with {len(dataset)} samples")
        except FileNotFoundError:
            print("✗ Dataset not found. Generating new dataset...")
            dataset = dataset_gen.generate_dataset(num_samples=50)
            dataset_gen.save_dataset()
    else:
        dataset = dataset_gen.generate_dataset(num_samples=50)
    
    # Training loop
    episode_rewards = []
    episode_losses = []
    episode_bugs_found = []
    
    try:
        for episode in range(num_episodes):
            # Sample random code from dataset
            code_sample = np.random.choice(dataset)['code'] if use_dataset else None
            state = env.reset(code_sample)
            
            episode_reward = 0
            episode_loss = 0
            steps = 0
            done = False
            
            while not done and steps < 50:
                # Agent selects action
                if agent_type == 'dqn':
                    action = agent.act(state, training=True)
                else:
                    action = agent.act(state)
                
                # Environment step
                next_state, reward, done, info = env.step(action)
                episode_reward += reward
                
                # Store experience
                if agent_type == 'dqn':
                    agent.remember(state, action, reward, next_state, done)
                    
                    # Train on batch
                    if len(agent.memory) > batch_size:
                        loss = agent.replay(batch_size)
                        episode_loss += loss
                
                state = next_state
                steps += 1
            
            # Update epsilon
            if agent_type == 'dqn':
                agent.decay_epsilon()
                agent.record_training(episode, episode_reward, episode_loss / max(steps, 1))
                
                # Update target network periodically
                if (episode + 1) % update_target_freq == 0:
                    agent.update_target_model()
            
            episode_rewards.append(episode_reward)
            episode_losses.append(episode_loss / max(steps, 1))
            episode_bugs_found.append(info['bugs_found'])
            
            # Print progress
            if (episode + 1) % 10 == 0:
                avg_reward = np.mean(episode_rewards[-10:])
                avg_bugs = np.mean([len(b) for b in episode_bugs_found[-10:]])
                print(f"Episode {episode+1}/{num_episodes} | "
                      f"Avg Reward: {avg_reward:.2f} | "
                      f"Avg Bugs Found: {avg_bugs:.2f} | "
                      f"Epsilon: {agent.epsilon:.3f}")
    
    except KeyboardInterrupt:
        print("\n✗ Training interrupted by user")
    
    print("\n✓ Training completed!")
    
    # Save model
    model_name = f"code_tester_{agent_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.h5"
    if agent_type == 'dqn':
        agent.save(os.path.join('models', model_name))
        print(f"✓ Model saved to models/{model_name}")
    
    # Plot results
    plot_training_results(episode_rewards, episode_losses, agent_type)
    
    return {
        'agent': agent,
        'env': env,
        'rewards': episode_rewards,
        'losses': episode_losses,
        'bugs_found': episode_bugs_found
    }


def plot_training_results(rewards: list, losses: list, agent_type: str):
    """Plot training results."""
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    
    # Rewards
    axes[0].plot(rewards, alpha=0.7)
    axes[0].set_title('Episode Rewards')
    axes[0].set_xlabel('Episode')
    axes[0].set_ylabel('Total Reward')
    axes[0].grid(True, alpha=0.3)
    
    # Losses
    axes[1].plot(losses, alpha=0.7)
    axes[1].set_title('Training Loss')
    axes[1].set_xlabel('Episode')
    axes[1].set_ylabel('Loss')
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plot_name = f"training_{agent_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    plt.savefig(os.path.join('models', plot_name), dpi=100)
    print(f"✓ Training plot saved to models/{plot_name}")
    plt.close()


def evaluate_agent(agent: DQNAgent, env: CodeTestingEnv, num_episodes: int = 10):
    """Evaluate trained agent."""
    print(f"\n{'='*60}")
    print(f"Evaluating Agent (greedy policy)")
    print(f"{'='*60}\n")
    
    evaluation_rewards = []
    evaluation_bugs = []
    
    for episode in range(num_episodes):
        state = env.reset()
        episode_reward = 0
        bugs_found = 0
        done = False
        steps = 0
        
        while not done and steps < 50:
            # Use greedy policy (no exploration)
            action = agent.act(state, training=False)
            next_state, reward, done, info = env.step(action)
            
            episode_reward += reward
            bugs_found = len(info['bugs_found'])
            state = next_state
            steps += 1
        
        evaluation_rewards.append(episode_reward)
        evaluation_bugs.append(bugs_found)
        
        print(f"Episode {episode+1}: Reward={episode_reward:.0f}, Bugs Found={bugs_found}")
    
    print(f"\nAverage Reward: {np.mean(evaluation_rewards):.2f}")
    print(f"Average Bugs Found: {np.mean(evaluation_bugs):.2f}")
    
    return evaluation_rewards, evaluation_bugs


def generate_and_save_dataset(num_samples: int = 100):
    """Generate and save training dataset."""
    print(f"\n{'='*60}")
    print(f"Generating Dataset")
    print(f"{'='*60}\n")
    
    dataset_gen = CodeTestingDataset(output_dir='dataset')
    dataset = dataset_gen.generate_dataset(num_samples=num_samples)
    dataset_gen.save_dataset('coding_dataset.json')
    
    stats = dataset_gen.generate_statistics()
    print("\nDataset Statistics:")
    print(f"Total Samples: {stats['total_samples']}")
    print(f"By Difficulty: {stats['by_difficulty']}")
    print(f"By Bug Type: {stats['by_bug_type']}")
    print(f"Average Complexity: {stats['avg_complexity']:.2f}")
    
    return dataset


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train AI Code Testing Agent')
    parser.add_argument('--episodes', type=int, default=50, help='Number of training episodes')
    parser.add_argument('--agent', type=str, default='dqn', choices=['dqn', 'policy_gradient'],
                        help='Agent type')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--generate-dataset', action='store_true', help='Generate new dataset')
    parser.add_argument('--dataset-size', type=int, default=100, help='Size of dataset to generate')
    parser.add_argument('--eval-only', action='store_true', help='Only evaluate (no training)')
    parser.add_argument('--model-path', type=str, help='Path to load pre-trained model')
    
    args = parser.parse_args()
    
    # Create output directories
    os.makedirs('models', exist_ok=True)
    os.makedirs('dataset', exist_ok=True)
    
    # Generate dataset if requested
    if args.generate_dataset:
        generate_and_save_dataset(num_samples=args.dataset_size)
    
    # Train or evaluate
    if not args.eval_only:
        results = train_dqn_agent(
            num_episodes=args.episodes,
            agent_type=args.agent,
            batch_size=args.batch_size
        )
        
        # Evaluate
        eval_rewards, eval_bugs = evaluate_agent(results['agent'], results['env'], num_episodes=10)
    
    print("\n✓ Complete!")
