import numpy as np
import matplotlib.pyplot as plt
from rl_code_testing_env import CodeTestingEnv
from rl_code_testing_model import DQNAgent
from training_dataset import CODE_TESTING_DATASET, get_random_sample
import os

def train_rl_model(episodes=1000, batch_size=32, target_update_freq=10):
    """
    Train the RL model for code testing
    """
    print("=" * 60)
    print("TRAINING RL MODEL FOR CODE TESTING")
    print("=" * 60)

    # Get a sample code snippet for training
    sample_data = get_random_sample()
    print(f"Training on code: {sample_data['description']}")

    # Create environment
    env = CodeTestingEnv(
        code_snippet=sample_data['code'],
        possible_inputs=sample_data['possible_inputs'],
        expected_outputs=sample_data['expected_outputs'],
        max_steps=10
    )

    # Create agent
    state_size = env.observation_space.shape[0]
    action_size = env.action_space.n
    agent = DQNAgent(state_size, action_size)

    print(f"State size: {state_size}")
    print(f"Action size: {action_size}")
    print(f"Training for {episodes} episodes...")

    # Training loop
    rewards_history = []
    epsilon_history = []

    for episode in range(episodes):
        state = env.reset()
        state = np.reshape(state, [1, state_size])
        total_reward = 0

        done = False
        while not done:
            # Choose action
            action = agent.act(state)

            # Take action
            next_state, reward, done, info = env.step(action)
            next_state = np.reshape(next_state, [1, state_size])

            # Remember experience
            agent.remember(state, action, reward, next_state, done)

            # Update state
            state = next_state
            total_reward += reward

            # Train agent
            if len(agent.memory) > batch_size:
                agent.replay(batch_size)

        # Update target model
        if episode % target_update_freq == 0:
            agent.update_target_model()

        # Record metrics
        rewards_history.append(total_reward)
        epsilon_history.append(agent.epsilon)

        # Print progress
        if (episode + 1) % 100 == 0:
            avg_reward = np.mean(rewards_history[-100:])
            print(f"Episode {episode + 1}/{episodes}, Avg Reward: {avg_reward:.2f}, Epsilon: {agent.epsilon:.3f}")

    print("\nTraining completed!")

    # Save the model
    model_path = "rl_code_testing_model.h5"
    agent.save(model_path)
    print(f"Model saved to {model_path}")

    # Plot training results
    plt.figure(figsize=(12, 4))

    plt.subplot(1, 2, 1)
    plt.plot(rewards_history)
    plt.title('Rewards per Episode')
    plt.xlabel('Episode')
    plt.ylabel('Total Reward')

    plt.subplot(1, 2, 2)
    plt.plot(epsilon_history)
    plt.title('Epsilon Decay')
    plt.xlabel('Episode')
    plt.ylabel('Epsilon')

    plt.tight_layout()
    plt.savefig('training_results.png')
    plt.show()

    return agent, rewards_history

def evaluate_model(agent, num_episodes=10):
    """
    Evaluate the trained model
    """
    print("\n" + "=" * 60)
    print("EVALUATING TRAINED MODEL")
    print("=" * 60)

    total_rewards = []

    for episode in range(num_episodes):
        sample_data = get_random_sample()
        env = CodeTestingEnv(
            code_snippet=sample_data['code'],
            possible_inputs=sample_data['possible_inputs'],
            expected_outputs=sample_data['expected_outputs'],
            max_steps=10
        )

        state_size = env.observation_space.shape[0]
        state = env.reset()
        state = np.reshape(state, [1, state_size])
        total_reward = 0

        print(f"\nEpisode {episode + 1}: {sample_data['description']}")

        done = False
        step = 0
        while not done and step < 10:
            action = agent.act(state)  # Use greedy policy (no exploration)
            next_state, reward, done, info = env.step(action)
            next_state = np.reshape(next_state, [1, state_size])

            print(f"  Step {step + 1}: Action {action} ({env.possible_inputs[action]}), Reward: {reward}")
            if 'result' in info:
                print(f"    Result: {info['result']}")

            state = next_state
            total_reward += reward
            step += 1

        total_rewards.append(total_reward)
        print(f"  Total Reward: {total_reward}")

    avg_reward = np.mean(total_rewards)
    print(f"\nAverage Reward over {num_episodes} episodes: {avg_reward:.2f}")

    return total_rewards

def main():
    """Main training function"""
    # Train the model
    agent, rewards_history = train_rl_model(episodes=500, batch_size=32)

    # Evaluate the model
    evaluate_model(agent, num_episodes=5)

    print("\n" + "=" * 60)
    print("TRAINING AND EVALUATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
