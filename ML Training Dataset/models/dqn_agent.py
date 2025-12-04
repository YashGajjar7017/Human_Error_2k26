"""
Deep Q-Network (DQN) Agent for Code Testing RL Environment
Learns optimal testing strategies to maximize bug detection.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from collections import deque
import json
from typing import Tuple, List, Dict


class DQNAgent:
    """
    Deep Q-Network agent for learning optimal code testing strategies.
    """
    
    def __init__(
        self,
        state_size: int = 5,
        action_size: int = 6,
        learning_rate: float = 0.001,
        gamma: float = 0.95,
        epsilon: float = 1.0,
        epsilon_decay: float = 0.995,
        epsilon_min: float = 0.01,
        memory_size: int = 2000
    ):
        """
        Args:
            state_size: Size of state space (5 features)
            action_size: Number of actions (6 testing strategies)
            learning_rate: Learning rate for optimizer
            gamma: Discount factor
            epsilon: Exploration rate
            epsilon_decay: Rate of epsilon decay
            epsilon_min: Minimum epsilon value
            memory_size: Size of experience replay buffer
        """
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        
        # Experience replay buffer
        self.memory = deque(maxlen=memory_size)
        self.batch_size = 32
        
        # Build neural networks
        self.model = self._build_model()
        self.target_model = self._build_model()
        self.update_target_model()
        
        # Training tracking
        self.train_history = {
            'episode': [],
            'reward': [],
            'loss': [],
            'epsilon': []
        }
    
    def _build_model(self) -> keras.Model:
        """Build DQN neural network architecture."""
        model = keras.Sequential([
            layers.Input(shape=(self.state_size,)),
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(self.action_size, activation='linear')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.learning_rate),
            loss='mse'
        )
        
        return model
    
    def update_target_model(self):
        """Update target network weights to match main network."""
        self.target_model.set_weights(self.model.get_weights())
    
    def remember(self, state: np.ndarray, action: int, reward: float, 
                 next_state: np.ndarray, done: bool):
        """Store experience in replay buffer."""
        self.memory.append((state, action, reward, next_state, done))
    
    def act(self, state: np.ndarray, training: bool = True) -> int:
        """Choose action using epsilon-greedy strategy."""
        if training and np.random.random() < self.epsilon:
            # Explore: random action
            return np.random.choice(self.action_size)
        
        # Exploit: use network to predict best action
        q_values = self.model.predict(state.reshape(1, -1), verbose=0)
        return np.argmax(q_values[0])
    
    def replay(self, batch_size: int = None) -> float:
        """Train on a batch from experience replay buffer."""
        if batch_size is None:
            batch_size = self.batch_size
        
        if len(self.memory) < batch_size:
            return 0.0
        
        # Sample random batch from memory
        batch_indices = np.random.choice(len(self.memory), batch_size, replace=False)
        batch = [self.memory[i] for i in batch_indices]
        
        states = np.array([exp[0] for exp in batch])
        actions = np.array([exp[1] for exp in batch])
        rewards = np.array([exp[2] for exp in batch])
        next_states = np.array([exp[3] for exp in batch])
        dones = np.array([exp[4] for exp in batch])
        
        # Predict Q-values
        targets = self.model.predict(states, verbose=0)
        next_q_values = self.target_model.predict(next_states, verbose=0)
        
        # Update Q-values with Bellman equation
        for i in range(batch_size):
            if dones[i]:
                targets[i][actions[i]] = rewards[i]
            else:
                targets[i][actions[i]] = rewards[i] + self.gamma * np.max(next_q_values[i])
        
        # Train and get loss
        history = self.model.fit(states, targets, epochs=1, verbose=0)
        loss = history.history['loss'][0]
        
        return loss
    
    def decay_epsilon(self):
        """Decay exploration rate."""
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
    
    def save(self, filepath: str):
        """Save model and training history."""
        self.model.save(filepath)
        
        # Also save history
        history_path = filepath.replace('.h5', '_history.json')
        with open(history_path, 'w') as f:
            json.dump(self.train_history, f, indent=2)
    
    def load(self, filepath: str):
        """Load saved model."""
        self.model = keras.models.load_model(filepath)
        self.target_model = keras.models.load_model(filepath)
        
        # Load history if available
        history_path = filepath.replace('.h5', '_history.json')
        try:
            with open(history_path, 'r') as f:
                self.train_history = json.load(f)
        except FileNotFoundError:
            pass
    
    def record_training(self, episode: int, reward: float, loss: float):
        """Record training metrics."""
        self.train_history['episode'].append(episode)
        self.train_history['reward'].append(reward)
        self.train_history['loss'].append(loss)
        self.train_history['epsilon'].append(self.epsilon)


class PolicyGradientAgent:
    """
    Policy Gradient Agent as alternative to DQN.
    Better for continuous or complex action spaces.
    """
    
    def __init__(
        self,
        state_size: int = 5,
        action_size: int = 6,
        learning_rate: float = 0.001
    ):
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        
        # Build actor (policy) network
        self.actor = self._build_actor()
        self.critic = self._build_critic()
        
        self.train_history = {'episode': [], 'reward': []}
    
    def _build_actor(self) -> keras.Model:
        """Build policy network (actor)."""
        model = keras.Sequential([
            layers.Input(shape=(self.state_size,)),
            layers.Dense(64, activation='relu'),
            layers.Dense(64, activation='relu'),
            layers.Dense(self.action_size, activation='softmax')
        ])
        
        model.compile(optimizer=keras.optimizers.Adam(learning_rate=self.learning_rate))
        return model
    
    def _build_critic(self) -> keras.Model:
        """Build value network (critic)."""
        model = keras.Sequential([
            layers.Input(shape=(self.state_size,)),
            layers.Dense(64, activation='relu'),
            layers.Dense(64, activation='relu'),
            layers.Dense(1, activation='linear')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.learning_rate),
            loss='mse'
        )
        return model
    
    def act(self, state: np.ndarray) -> int:
        """Sample action from policy."""
        action_probs = self.actor.predict(state.reshape(1, -1), verbose=0)[0]
        return np.random.choice(self.action_size, p=action_probs)
    
    def train_step(self, state: np.ndarray, action: int, reward: float, 
                   next_state: np.ndarray, done: bool):
        """Single training step with actor-critic loss."""
        # Compute advantage
        value = self.critic.predict(state.reshape(1, -1), verbose=0)[0][0]
        next_value = 0 if done else self.critic.predict(next_state.reshape(1, -1), verbose=0)[0][0]
        td_target = reward + 0.99 * next_value
        advantage = td_target - value
        
        # Train critic
        self.critic.fit(state.reshape(1, -1), np.array([[td_target]]), epochs=1, verbose=0)
        
        # Train actor (policy gradient)
        with tf.GradientTape() as tape:
            action_probs = self.actor(state.reshape(1, -1))
            action_log_probs = tf.math.log(action_probs[0][action] + 1e-10)
            loss = -action_log_probs * advantage
        
        grads = tape.gradient(loss, self.actor.trainable_variables)
        for grad, var in zip(grads, self.actor.trainable_variables):
            if grad is not None:
                var.assign_sub(self.learning_rate * grad)
