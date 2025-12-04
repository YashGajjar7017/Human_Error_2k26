"""
__init__.py - Make AI_CodeTester a Python package
"""

__version__ = "0.1.0"
__author__ = "AI Code Testing Team"

from .envs.code_testing_env import CodeTestingEnv
from .models.dqn_agent import DQNAgent, PolicyGradientAgent
from .dataset.dataset_generator import CodeTestingDataset

__all__ = [
    'CodeTestingEnv',
    'DQNAgent',
    'PolicyGradientAgent',
    'CodeTestingDataset'
]
