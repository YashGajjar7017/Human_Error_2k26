"""
Reinforcement Learning Environment for Automated Code Testing
Tests code samples and learns to detect bugs, generate effective test cases.
"""

import numpy as np
import gym
from gym import spaces
import subprocess
import tempfile
import os
import json
from typing import Tuple, Dict, Any, List


class CodeTestingEnv(gym.Env):
    """
    RL Environment for code testing.
    
    State: [code_complexity, num_functions, num_variables, previous_bugs_found, test_coverage]
    Action: Choose test strategy (0-5):
        0: Edge case testing (boundary values)
        1: Random input testing (fuzzing)
        2: Type mismatch testing
        3: Overflow/underflow testing
        4: Logic path testing (branch coverage)
        5: Integration testing (multiple functions)
    
    Reward:
        +10 for finding a bug
        +5 for improving test coverage
        +2 for each test case executed
        -1 for redundant test (already found this bug)
        -5 for invalid test
        -10 for timeout/crash
    """
    
    metadata = {'render.modes': ['human']}
    
    def __init__(self, max_episodes=1000, timeout=5):
        super(CodeTestingEnv, self).__init__()
        
        self.max_episodes = max_episodes
        self.timeout = timeout
        self.episode = 0
        
        # State space: [code_complexity, num_functions, num_variables, bugs_found, test_coverage]
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0, 0, 0]),
            high=np.array([100, 50, 200, 100, 100]),
            dtype=np.float32
        )
        
        # Action space: 6 testing strategies
        self.action_space = spaces.Discrete(6)
        
        # Current code being tested
        self.current_code = None
        self.current_bugs = []
        self.test_history = []
        self.coverage = 0.0
        self.bugs_found = 0
        
    def reset(self, code_sample: str = None) -> np.ndarray:
        """Reset environment with a new code sample."""
        self.current_code = code_sample or self._generate_default_code()
        self.current_bugs = self._analyze_code(self.current_code)
        self.test_history = []
        self.coverage = 0.0
        self.bugs_found = 0
        self.episode += 1
        
        return self._get_state()
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict]:
        """Execute one testing action."""
        reward = 0
        found_bugs = []
        test_passed = False
        
        try:
            test_cases = self._generate_test_cases(action)
            
            for test_case in test_cases:
                result = self._run_test(test_case)
                
                if result['crashed'] or result['timeout']:
                    reward -= 10
                    found_bugs.append({
                        'type': 'crash' if result['crashed'] else 'timeout',
                        'test': test_case
                    })
                elif result['assertion_failed']:
                    reward += 10
                    self.bugs_found += 1
                    found_bugs.append({
                        'type': 'assertion',
                        'test': test_case,
                        'error': result['error']
                    })
                else:
                    reward += 2
                    self.coverage += 2
                    test_passed = True
            
            # Penalize redundant tests
            if self._is_redundant_test(test_cases):
                reward -= 1
            else:
                reward += 5
            
            self.test_history.append({
                'action': action,
                'tests': test_cases,
                'bugs_found': found_bugs,
                'reward': reward
            })
            
        except Exception as e:
            reward -= 5
        
        done = self.episode >= self.max_episodes or self.bugs_found >= len(self.current_bugs)
        state = self._get_state()
        info = {
            'bugs_found': found_bugs,
            'total_bugs': len(self.current_bugs),
            'coverage': min(self.coverage, 100),
            'test_count': len(self.test_history)
        }
        
        return state, reward, done, info
    
    def _get_state(self) -> np.ndarray:
        """Extract state features from current code."""
        complexity = self._estimate_complexity(self.current_code)
        num_funcs = self.current_code.count('def ') + self.current_code.count('function ')
        num_vars = self.current_code.count('=') - self.current_code.count('==')
        
        state = np.array([
            min(complexity, 100),
            min(num_funcs, 50),
            min(num_vars, 200),
            min(self.bugs_found, 100),
            min(self.coverage, 100)
        ], dtype=np.float32)
        
        return state
    
    def _generate_test_cases(self, action: int) -> List[Dict]:
        """Generate test cases based on action (testing strategy)."""
        test_cases = []
        
        if action == 0:  # Edge case testing
            test_cases = [
                {'input': 0, 'desc': 'zero'},
                {'input': -1, 'desc': 'negative'},
                {'input': 999999, 'desc': 'large value'},
                {'input': '', 'desc': 'empty string'},
            ]
        elif action == 1:  # Random input testing (fuzzing)
            test_cases = [
                {'input': np.random.randint(-1000, 1000), 'desc': 'random int'},
                {'input': np.random.rand(), 'desc': 'random float'},
                {'input': ''.join(chr(np.random.randint(65, 91)) for _ in range(10)), 'desc': 'random string'},
            ]
        elif action == 2:  # Type mismatch testing
            test_cases = [
                {'input': 'string', 'desc': 'string instead of int'},
                {'input': [1, 2, 3], 'desc': 'list instead of scalar'},
                {'input': None, 'desc': 'None value'},
            ]
        elif action == 3:  # Overflow/underflow
            test_cases = [
                {'input': 2**31 - 1, 'desc': 'int overflow'},
                {'input': -(2**31), 'desc': 'int underflow'},
                {'input': float('inf'), 'desc': 'infinity'},
            ]
        elif action == 4:  # Logic path testing
            test_cases = [
                {'input': [1, 2, 3], 'desc': 'sorted list'},
                {'input': [3, 2, 1], 'desc': 'reverse sorted'},
                {'input': [2, 1, 3], 'desc': 'unsorted'},
            ]
        elif action == 5:  # Integration testing
            test_cases = [
                {'input': [1, 2], 'input2': [3, 4], 'desc': 'multiple inputs'},
                {'input': {'a': 1, 'b': 2}, 'desc': 'dict input'},
            ]
        
        return test_cases
    
    def _run_test(self, test_case: Dict) -> Dict:
        """Execute a test case against current code."""
        result = {
            'passed': False,
            'crashed': False,
            'timeout': False,
            'assertion_failed': False,
            'error': None
        }
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                test_code = f"""
{self.current_code}

# Test execution
try:
    input_data = {test_case.get('input')}
    expected = None  # Would be set based on test
    result = main(input_data) if 'main' in dir() else None
    assert result is not None, "No output"
    print("PASS")
except AssertionError as e:
    print(f"FAIL: {{e}}")
except Exception as e:
    print(f"ERROR: {{e}}")
"""
                f.write(test_code)
                f.flush()
                
                proc = subprocess.run(
                    ['python', f.name],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
                
                if 'PASS' in proc.stdout:
                    result['passed'] = True
                elif 'FAIL' in proc.stdout:
                    result['assertion_failed'] = True
                    result['error'] = proc.stdout
                else:
                    result['crashed'] = True
                    result['error'] = proc.stderr
                
                os.unlink(f.name)
        except subprocess.TimeoutExpired:
            result['timeout'] = True
        except Exception as e:
            result['crashed'] = True
            result['error'] = str(e)
        
        return result
    
    def _analyze_code(self, code: str) -> List[Dict]:
        """Analyze code and identify potential bugs."""
        bugs = []
        
        # Simple heuristics for bug detection
        if 'while True' in code and 'break' not in code:
            bugs.append({'type': 'infinite_loop', 'severity': 'high'})
        if 'except:' in code:
            bugs.append({'type': 'bare_except', 'severity': 'medium'})
        if code.count('[0]') > 3:
            bugs.append({'type': 'potential_indexing', 'severity': 'low'})
        if '/' in code and '% 0' not in code:
            bugs.append({'type': 'division_by_zero', 'severity': 'high'})
        
        return bugs
    
    def _estimate_complexity(self, code: str) -> int:
        """Estimate cyclomatic complexity."""
        complexity = 1
        complexity += code.count('if ')
        complexity += code.count('for ')
        complexity += code.count('while ')
        complexity += code.count('and ')
        complexity += code.count('or ')
        return min(complexity, 100)
    
    def _is_redundant_test(self, test_cases: List[Dict]) -> bool:
        """Check if test is redundant (already in history)."""
        if not self.test_history:
            return False
        
        last_tests = [t['tests'] for t in self.test_history[-3:]]
        for prev_test in last_tests:
            if prev_test == test_cases:
                return True
        return False
    
    def _generate_default_code(self) -> str:
        """Generate a simple default code sample."""
        return """
def add(a, b):
    return a + b

def divide(a, b):
    return a / b

def find_max(lst):
    if not lst:
        return None
    return max(lst)
"""
    
    def render(self, mode='human'):
        """Render environment state."""
        print(f"\n=== Episode {self.episode} ===")
        print(f"Bugs found: {self.bugs_found}")
        print(f"Coverage: {self.coverage:.1f}%")
        print(f"Tests run: {len(self.test_history)}")
