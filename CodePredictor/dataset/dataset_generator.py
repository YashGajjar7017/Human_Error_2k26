"""
Training Dataset Generator & Manager
Creates dataset from user code patterns and samples.
"""

import json
import os
from typing import List, Dict
import random
import hashlib


class CodeDatasetGenerator:
    """Generate training dataset from code samples."""
    
    # Sample code snippets for initial training
    SAMPLE_CODES = [
        """
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
""",
        """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
""",
        """
class Calculator:
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b
""",
        """
def sort_array(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] > arr[j]:
                arr[i], arr[j] = arr[j], arr[i]
    return arr
""",
        """
def is_palindrome(s):
    s = s.lower()
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
""",
        """
async def fetch_data(url):
    try:
        response = await requests.get(url)
        return response.json()
    except Exception as e:
        print(f"Error: {e}")
        return None
""",
        """
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.json({message: 'Hello World'});
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
""",
        """
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[0];
    const left = arr.slice(1).filter(x => x < pivot);
    const right = arr.slice(1).filter(x => x >= pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}
""",
        """
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]
""",
        """
class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def display(self):
        current = self.head
        while current:
            print(current.data, end=' -> ')
            current = current.next
"""
    ]
    
    def __init__(self, output_dir: str = 'dataset'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.samples = []
    
    def generate_dataset(self, num_samples: int = 50) -> List[Dict]:
        """Generate training dataset."""
        print(f"\nGenerating dataset with {num_samples} samples...")
        
        self.samples = []
        
        # Add sample codes
        for i in range(min(num_samples, len(self.SAMPLE_CODES))):
            code = self.SAMPLE_CODES[i]
            sample = {
                'id': i,
                'code': code.strip(),
                'language': 'python' if 'def ' in code or 'class ' in code else 'javascript',
                'source': 'builtin',
                'lines': len(code.strip().split('\n')),
                'hash': self._hash_code(code)
            }
            self.samples.append(sample)
        
        # Generate variations/permutations
        if num_samples > len(self.SAMPLE_CODES):
            remaining = num_samples - len(self.SAMPLE_CODES)
            for i in range(remaining):
                base_code = random.choice(self.SAMPLE_CODES)
                varied_code = self._create_variation(base_code)
                sample = {
                    'id': len(self.samples),
                    'code': varied_code.strip(),
                    'language': 'python' if 'def ' in varied_code else 'javascript',
                    'source': 'generated',
                    'lines': len(varied_code.strip().split('\n')),
                    'hash': self._hash_code(varied_code)
                }
                self.samples.append(sample)
        
        print(f"✓ Generated {len(self.samples)} samples")
        return self.samples
    
    def _hash_code(self, code: str) -> str:
        """Create hash of code for deduplication."""
        return hashlib.md5(code.encode()).hexdigest()[:8]
    
    def _create_variation(self, code: str) -> str:
        """Create variation of code sample."""
        variations = [
            lambda c: c.replace('n', 'n_input'),
            lambda c: c.replace('arr', 'array'),
            lambda c: c.replace('i', 'index'),
            lambda c: c.replace('    ', '  '),  # Different indentation
            lambda c: c.replace('return', 'yield'),
        ]
        
        variation = random.choice(variations)(code)
        return variation
    
    def add_user_code(self, code: str, user_id: str = 'anonymous') -> Dict:
        """Add user-written code to dataset."""
        sample = {
            'id': len(self.samples),
            'code': code.strip(),
            'language': self._detect_language(code),
            'source': 'user',
            'user_id': user_id,
            'lines': len(code.strip().split('\n')),
            'hash': self._hash_code(code)
        }
        
        # Check for duplicates
        if sample['hash'] not in [s.get('hash') for s in self.samples]:
            self.samples.append(sample)
            print(f"✓ Added user code: {sample['lines']} lines")
            return sample
        else:
            print(f"! Code already in dataset (duplicate)")
            return None
    
    def _detect_language(self, code: str) -> str:
        """Detect programming language."""
        if 'def ' in code or 'import ' in code or 'class ' in code:
            return 'python'
        elif 'function ' in code or 'const ' in code or 'let ' in code:
            return 'javascript'
        elif '#include' in code or 'int main' in code:
            return 'cpp'
        elif 'public class' in code or 'System.out' in code:
            return 'java'
        else:
            return 'unknown'
    
    def save_dataset(self, filename: str = 'training_dataset.json') -> str:
        """Save dataset to JSON."""
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w') as f:
            json.dump(self.samples, f, indent=2)
        print(f"✓ Dataset saved to {filepath}")
        return filepath
    
    def load_dataset(self, filename: str = 'training_dataset.json') -> List[Dict]:
        """Load dataset from JSON."""
        filepath = os.path.join(self.output_dir, filename)
        try:
            with open(filepath, 'r') as f:
                self.samples = json.load(f)
            print(f"✓ Dataset loaded: {len(self.samples)} samples")
            return self.samples
        except FileNotFoundError:
            print(f"✗ Dataset not found: {filepath}")
            return []
    
    def get_training_codes(self) -> List[str]:
        """Get all code samples for training."""
        return [s['code'] for s in self.samples]
    
    def get_by_language(self, language: str) -> List[Dict]:
        """Get samples by language."""
        return [s for s in self.samples if s['language'] == language]
    
    def get_statistics(self) -> Dict:
        """Get dataset statistics."""
        if not self.samples:
            return {}
        
        stats = {
            'total_samples': len(self.samples),
            'by_language': {},
            'by_source': {},
            'total_lines': sum(s['lines'] for s in self.samples),
            'avg_lines_per_sample': sum(s['lines'] for s in self.samples) / len(self.samples)
        }
        
        for sample in self.samples:
            lang = sample['language']
            src = sample['source']
            stats['by_language'][lang] = stats['by_language'].get(lang, 0) + 1
            stats['by_source'][src] = stats['by_source'].get(src, 0) + 1
        
        return stats
    
    def export_for_training(self, filename: str = 'training_codes.txt') -> str:
        """Export all code samples to single text file."""
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w') as f:
            for sample in self.samples:
                f.write(sample['code'])
                f.write('\n\n')
        print(f"✓ Exported {len(self.samples)} code samples to {filepath}")
        return filepath
