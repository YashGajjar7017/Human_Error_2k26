"""
Dataset Generator for AI Code Testing
Creates synthetic code samples with known bugs for training.
"""

import json
import os
import random
from typing import List, Dict, Tuple
import numpy as np


class CodeTestingDataset:
    """Generate synthetic coding problems with known bugs."""
    
    def __init__(self, output_dir: str = 'dataset'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.samples = []
    
    def generate_dataset(self, num_samples: int = 100) -> List[Dict]:
        """Generate synthetic code samples with varying complexity and bugs."""
        self.samples = []
        
        for i in range(num_samples):
            difficulty = random.choice(['easy', 'medium', 'hard'])
            bug_type = random.choice(list(self.BUG_TEMPLATES.keys()))
            sample = self._create_sample(i, difficulty, bug_type)
            self.samples.append(sample)
        
        return self.samples
    
    def _create_sample(self, idx: int, difficulty: str, bug_type: str) -> Dict:
        """Create a single code sample with a known bug."""
        template = self.BUG_TEMPLATES[bug_type]
        
        code = template['code']
        
        # Add difficulty modifiers
        if difficulty == 'medium':
            code = self._add_helper_functions(code)
        elif difficulty == 'hard':
            code = self._add_helper_functions(code)
            code = self._add_complexity(code)
        
        return {
            'id': idx,
            'code': code,
            'language': 'python',
            'difficulty': difficulty,
            'bug_type': bug_type,
            'bugs': template['bugs'],
            'test_cases': template['test_cases'],
            'expected_output': template['expected_output'],
            'complexity_score': self._calculate_complexity(code)
        }
    
    BUG_TEMPLATES = {
        'infinite_loop': {
            'code': '''
def find_number(lst, target):
    i = 0
    while True:
        if lst[i] == target:
            return i
        i += 1
''',
            'bugs': [
                {'type': 'infinite_loop', 'line': 3, 'description': 'No boundary check for list length'}
            ],
            'test_cases': [
                {'input': [1, 2, 3], 'target': 5, 'expected': None},
                {'input': [5, 10, 15], 'target': 10, 'expected': 1}
            ],
            'expected_output': 'IndexError or infinite loop'
        },
        'off_by_one': {
            'code': '''
def process_array(arr):
    result = []
    for i in range(len(arr) + 1):
        result.append(arr[i] * 2)
    return result
''',
            'bugs': [
                {'type': 'off_by_one', 'line': 4, 'description': 'Loop goes one step too far'}
            ],
            'test_cases': [
                {'input': [1, 2, 3], 'expected': None},
                {'input': [1, 2], 'expected': None}
            ],
            'expected_output': 'IndexError'
        },
        'division_by_zero': {
            'code': '''
def calculate_average(numbers):
    if len(numbers) == 0:
        return None
    total = sum(numbers)
    average = total / (len(numbers) - 1)
    return average
''',
            'bugs': [
                {'type': 'division_by_zero', 'line': 6, 'description': 'Dividing by length-1 causes error when length is 1'}
            ],
            'test_cases': [
                {'input': [10], 'expected': None},
                {'input': [10, 20], 'expected': 10}
            ],
            'expected_output': 'ZeroDivisionError for single element'
        },
        'null_pointer': {
            'code': '''
def get_first_element(lst):
    return lst[0]

def process(data):
    if data:
        return get_first_element(data)
''',
            'bugs': [
                {'type': 'null_pointer', 'line': 7, 'description': 'No return value when data is falsy'}
            ],
            'test_cases': [
                {'input': [], 'expected': None},
                {'input': [1, 2, 3], 'expected': 1}
            ],
            'expected_output': 'IndexError for empty list'
        },
        'type_mismatch': {
            'code': '''
def add_numbers(a, b):
    return a + b

result = add_numbers("5", 3)
print(result)
''',
            'bugs': [
                {'type': 'type_mismatch', 'line': 5, 'description': 'String added to int'}
            ],
            'test_cases': [
                {'input_a': "5", 'input_b': 3, 'expected': None},
                {'input_a': 5, 'input_b': 3, 'expected': 8}
            ],
            'expected_output': 'TypeError'
        },
        'logic_error': {
            'code': '''
def is_even(n):
    if n % 2 == 1:
        return True
    return False

def count_evens(lst):
    count = 0
    for num in lst:
        if is_even(num):
            count += 1
    return count
''',
            'bugs': [
                {'type': 'logic_error', 'line': 3, 'description': 'is_even returns True for odd numbers'}
            ],
            'test_cases': [
                {'input': [1, 2, 3, 4], 'expected': 2},
                {'input': [2, 4, 6], 'expected': 3}
            ],
            'expected_output': 'Returns incorrect count'
        },
        'memory_leak': {
            'code': '''
class DataProcessor:
    def __init__(self):
        self.data = []
    
    def process(self, items):
        self.data.extend(items)
        return len(self.data)

processor = DataProcessor()
for i in range(1000):
    processor.process([i] * 100)
''',
            'bugs': [
                {'type': 'memory_leak', 'line': 7, 'description': 'Data keeps growing without cleanup'}
            ],
            'test_cases': [
                {'iterations': 1000, 'expected': 'Memory grows'}
            ],
            'expected_output': 'High memory usage'
        },
        'race_condition': {
            'code': '''
shared_counter = 0

def increment():
    global shared_counter
    temp = shared_counter
    temp += 1
    shared_counter = temp

# Called from multiple threads
increment()
''',
            'bugs': [
                {'type': 'race_condition', 'line': 4, 'description': 'Non-atomic read-modify-write'}
            ],
            'test_cases': [
                {'threads': 10, 'calls': 100, 'expected': 1000}
            ],
            'expected_output': 'Counter value less than expected'
        },
        'regex_error': {
            'code': '''
import re
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z{2,}$'
    return re.match(pattern, email) is not None
''',
            'bugs': [
                {'type': 'regex_error', 'line': 4, 'description': 'Missing closing bracket in regex'}
            ],
            'test_cases': [
                {'input': 'test@example.com', 'expected': True}
            ],
            'expected_output': 'Regex error'
        },
        'sql_injection': {
            'code': '''
def get_user(username):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return execute(query)
''',
            'bugs': [
                {'type': 'sql_injection', 'line': 3, 'description': 'String interpolation in SQL query'}
            ],
            'test_cases': [
                {'input': "admin' --", 'expected': None}
            ],
            'expected_output': 'Vulnerable to SQL injection'
        }
    }
    
    def _add_helper_functions(self, code: str) -> str:
        """Add helper functions to increase complexity."""
        helpers = '''
def helper_validate(value):
    return value is not None

def helper_format(value):
    return str(value).strip()

'''
        return helpers + code
    
    def _add_complexity(self, code: str) -> str:
        """Add nested logic to increase complexity."""
        complexity = '''
def validate_input(data):
    if isinstance(data, list):
        return all(isinstance(x, int) for x in data)
    return isinstance(data, int)

def preprocess(data):
    if validate_input(data):
        return [x for x in data if x > 0]
    return []

'''
        return complexity + code
    
    def _calculate_complexity(self, code: str) -> int:
        """Estimate cyclomatic complexity."""
        complexity = 1
        complexity += code.count('if ')
        complexity += code.count('for ')
        complexity += code.count('while ')
        complexity += code.count('elif ')
        complexity += code.count('except ')
        return min(complexity, 100)
    
    def save_dataset(self, filename: str = 'coding_dataset.json'):
        """Save dataset to JSON file."""
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w') as f:
            json.dump(self.samples, f, indent=2)
        print(f"✓ Dataset saved to {filepath} ({len(self.samples)} samples)")
        return filepath
    
    def load_dataset(self, filename: str = 'coding_dataset.json') -> List[Dict]:
        """Load dataset from JSON file."""
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'r') as f:
            self.samples = json.load(f)
        print(f"✓ Dataset loaded from {filepath} ({len(self.samples)} samples)")
        return self.samples
    
    def get_train_test_split(self, train_ratio: float = 0.8) -> Tuple[List[Dict], List[Dict]]:
        """Split dataset into train and test sets."""
        if not self.samples:
            raise ValueError("Dataset is empty. Generate or load dataset first.")
        
        split_idx = int(len(self.samples) * train_ratio)
        train_set = self.samples[:split_idx]
        test_set = self.samples[split_idx:]
        
        return train_set, test_set
    
    def get_samples_by_difficulty(self, difficulty: str) -> List[Dict]:
        """Get all samples of a specific difficulty."""
        return [s for s in self.samples if s['difficulty'] == difficulty]
    
    def get_samples_by_bug_type(self, bug_type: str) -> List[Dict]:
        """Get all samples with a specific bug type."""
        return [s for s in self.samples if s['bug_type'] == bug_type]
    
    def generate_statistics(self) -> Dict:
        """Generate statistics about the dataset."""
        if not self.samples:
            return {}
        
        difficulties = {}
        bug_types = {}
        
        for sample in self.samples:
            diff = sample['difficulty']
            bug = sample['bug_type']
            
            difficulties[diff] = difficulties.get(diff, 0) + 1
            bug_types[bug] = bug_types.get(bug, 0) + 1
        
        stats = {
            'total_samples': len(self.samples),
            'by_difficulty': difficulties,
            'by_bug_type': bug_types,
            'avg_complexity': np.mean([s['complexity_score'] for s in self.samples])
        }
        
        return stats
