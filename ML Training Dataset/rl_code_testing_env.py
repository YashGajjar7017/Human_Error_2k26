import gym
import numpy as np
import subprocess
import tempfile
import os
from gym import spaces

class CodeTestingEnv(gym.Env):
    """
    Custom Gym environment for reinforcement learning in code testing.
    The agent generates test inputs for code snippets and receives rewards
    based on execution outcomes (e.g., detecting errors, achieving coverage).
    """

    def __init__(self, code_snippet, possible_inputs, expected_outputs=None, max_steps=10):
        super(CodeTestingEnv, self).__init__()

        self.code_snippet = code_snippet
        self.possible_inputs = possible_inputs  # List of possible input strings
        self.expected_outputs = expected_outputs  # Dict mapping inputs to expected outputs
        self.max_steps = max_steps

        # Action space: Choose an input index
        self.action_space = spaces.Discrete(len(possible_inputs))

        # Observation space: Simple state representation (step count, last reward, etc.)
        # For simplicity, use a vector: [step, last_action, last_reward]
        self.observation_space = spaces.Box(low=0, high=max_steps, shape=(3,), dtype=np.float32)

        self.current_step = 0
        self.last_action = 0
        self.last_reward = 0
        self.total_reward = 0
        self.done = False

    def reset(self):
        self.current_step = 0
        self.last_action = 0
        self.last_reward = 0
        self.total_reward = 0
        self.done = False
        return np.array([self.current_step, self.last_action, self.last_reward], dtype=np.float32)

    def step(self, action):
        if self.done:
            raise RuntimeError("Episode is done")

        self.current_step += 1
        self.last_action = action

        # Get the input
        input_str = self.possible_inputs[action]

        # Execute the code with the input
        reward, info = self._execute_code(input_str)

        self.last_reward = reward
        self.total_reward += reward

        # Check if done
        if self.current_step >= self.max_steps:
            self.done = True

        # Observation
        obs = np.array([self.current_step, self.last_action, self.last_reward], dtype=np.float32)

        return obs, reward, self.done, info

    def _execute_code(self, input_str):
        """
        Execute the code snippet with the given input.
        Returns reward and info dict.
        """
        try:
            # Create a temporary Python file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(self.code_snippet)
                temp_file = f.name

            # Prepare the command
            cmd = ['python3', temp_file]
            if input_str:
                # If input is needed, use echo to pipe input
                cmd = ['echo', input_str, '|'] + cmd

            # Run the command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=5  # Timeout to prevent infinite loops
            )

            # Clean up
            os.unlink(temp_file)

            output = result.stdout.strip()
            error = result.stderr.strip()

            # Determine reward
            reward = 0
            info = {'output': output, 'error': error, 'input': input_str}

            if result.returncode != 0:
                # Code crashed - reward for finding a bug
                reward = 10
                info['result'] = 'crash'
            elif self.expected_outputs and input_str in self.expected_outputs:
                expected = self.expected_outputs[input_str]
                if output == expected:
                    # Correct output - small reward
                    reward = 1
                    info['result'] = 'correct'
                else:
                    # Wrong output - reward for detecting issue
                    reward = 5
                    info['result'] = 'wrong_output'
            else:
                # No expected output defined - neutral
                reward = 0
                info['result'] = 'no_expected'

            return reward, info

        except subprocess.TimeoutExpired:
            return -5, {'result': 'timeout', 'error': 'Execution timed out'}
        except Exception as e:
            return -5, {'result': 'error', 'error': str(e)}

    def render(self, mode='human'):
        print(f"Step: {self.current_step}, Last Action: {self.last_action}, Last Reward: {self.last_reward}, Total Reward: {self.total_reward}")

    def close(self):
        pass
