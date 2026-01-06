"""
Code Error Detection Dataset Generator
Generates training data for ML models to detect coding errors and issues
"""

import json
import os
from typing import List, Dict, Tuple

# Code samples with various error categories
CODE_SAMPLES = [
    # Logic Errors
    {
        "code": "def find_max(arr):\n    max_val = arr[0]\n    for i in range(len(arr)):\n        if arr[i] > max_val:\n            max_val = arr[i]\n    return max_val",
        "category": "logic_error",
        "error_type": "off_by_one",
        "severity": "low",
        "description": "Potential issue with empty array not handled",
        "error_location": [0, 50],
        "fix": "Add check for empty array before accessing arr[0]",
    },
    {
        "code": "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n - 1)",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct recursive factorial implementation",
        "error_location": None,
        "fix": None,
    },
    {
        "code": "def sum_list(lst):\n    total = 0\n    for item in lst:\n        total = total + item\n    return total",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct list summation",
        "error_location": None,
        "fix": None,
    },
    {
        "code": 'def reverse_string(s):\n    result = ""\n    for i in range(len(s) - 1, -1, -1):\n        result += s[i]\n    return result',
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct string reversal",
        "error_location": None,
        "fix": None,
    },
    # Syntax Errors
    {
        "code": "def calculate(a, b)\n    return a + b",
        "category": "syntax_error",
        "error_type": "missing_colon",
        "severity": "critical",
        "description": "Missing colon after function definition",
        "error_location": [20, 21],
        "fix": "Add ':' after function parameters",
    },
    {
        "code": "def process():\n    if x > 5\n        print('Greater')",
        "category": "syntax_error",
        "error_type": "missing_colon",
        "severity": "critical",
        "description": "Missing colon after if statement",
        "error_location": [26, 27],
        "fix": "Add ':' after if condition",
    },
    {
        "code": "result = [1, 2, 3\nprint(result)",
        "category": "syntax_error",
        "error_type": "unclosed_bracket",
        "severity": "critical",
        "description": "Unclosed list bracket",
        "error_location": [17, 18],
        "fix": "Close the list with ']'",
    },
    {
        "code": "x = 5\ny = 10\nprint(x + y)",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct variable assignment and usage",
        "error_location": None,
        "fix": None,
    },
    # Type Errors
    {
        "code": "def divide(a, b):\n    return a / b\nresult = divide('10', '2')",
        "category": "type_error",
        "error_type": "type_mismatch",
        "severity": "medium",
        "description": "String division instead of numeric",
        "error_location": [42, 58],
        "fix": "Convert strings to int or float before division",
    },
    {
        "code": "numbers = [1, 2, 3]\ntext = 'hello'\nresult = numbers + text",
        "category": "type_error",
        "error_type": "incompatible_types",
        "severity": "medium",
        "description": "Cannot concatenate list and string",
        "error_location": [54, 74],
        "fix": "Convert types or use appropriate method",
    },
    {
        "code": "x = 5\ny = '10'\nz = x + y",
        "category": "type_error",
        "error_type": "type_mismatch",
        "severity": "medium",
        "description": "Adding int and string",
        "error_location": [28, 34],
        "fix": "Convert y to int: int(y)",
    },
    # Null/Undefined Errors
    {
        "code": "def get_first_element(lst):\n    return lst[0]",
        "category": "null_reference",
        "error_type": "unchecked_access",
        "severity": "medium",
        "description": "No check for empty list before access",
        "error_location": [40, 48],
        "fix": "Add length check: if lst: return lst[0]",
    },
    {
        "code": "def process_data(data):\n    if data:\n        return data['key']\n    return None",
        "category": "null_reference",
        "error_type": "missing_key_check",
        "severity": "medium",
        "description": "No check for key existence in dictionary",
        "error_location": [42, 56],
        "fix": "Use data.get('key') or check 'key' in data",
    },
    # Resource Leaks
    {
        "code": "def read_file(filename):\n    f = open(filename, 'r')\n    content = f.read()\n    return content",
        "category": "resource_leak",
        "error_type": "unclosed_file",
        "severity": "medium",
        "description": "File not closed after reading",
        "error_location": [26, 40],
        "fix": "Use 'with' statement or call f.close()",
    },
    {
        "code": "def safe_read_file(filename):\n    with open(filename, 'r') as f:\n        content = f.read()\n    return content",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Proper file handling with context manager",
        "error_location": None,
        "fix": None,
    },
    # Variable Naming
    {
        "code": "def calc(x, y, z):\n    a = x + y\n    b = a * z\n    return b",
        "category": "naming_issue",
        "error_type": "unclear_names",
        "severity": "low",
        "description": "Poor variable naming reduces readability",
        "error_location": [0, 50],
        "fix": "Use descriptive names: result = sum, total = result * multiplier",
    },
    {
        "code": "def calculate_total_price(items, tax_rate):\n    subtotal = sum(items)\n    tax = subtotal * tax_rate\n    total = subtotal + tax\n    return total",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Clear and descriptive variable names",
        "error_location": None,
        "fix": None,
    },
    # Off-by-One Errors
    {
        "code": "def print_range(n):\n    for i in range(n):\n        print(i)",
        "category": "logic_error",
        "error_type": "off_by_one",
        "severity": "low",
        "description": "Correct implementation",
        "error_location": None,
        "fix": None,
    },
    {
        "code": "def get_last_n_items(lst, n):\n    return lst[len(lst) - n:]",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct slicing for last n items",
        "error_location": None,
        "fix": None,
    },
    # Infinite Loops
    {
        "code": "def infinite_loop():\n    x = 0\n    while True:\n        print(x)\n        # x never incremented",
        "category": "logic_error",
        "error_type": "infinite_loop",
        "severity": "critical",
        "description": "Infinite loop - variable not updated",
        "error_location": [31, 54],
        "fix": "Add x += 1 before end of loop",
    },
    {
        "code": "def count_down(n):\n    while n > 0:\n        print(n)\n        n -= 1",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct countdown loop",
        "error_location": None,
        "fix": None,
    },
    # Boundary Conditions
    {
        "code": "def get_percentage(value, total):\n    if total == 0:\n        return 0\n    return (value / total) * 100",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Proper boundary condition check",
        "error_location": None,
        "fix": None,
    },
    {
        "code": "def divide_safe(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return float('inf')",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Exception handling for edge case",
        "error_location": None,
        "fix": None,
    },
    # Incorrect Algorithm
    {
        "code": "def bubble_sort(arr):\n    for i in range(len(arr)):\n        for j in range(len(arr) - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct bubble sort implementation",
        "error_location": None,
        "fix": None,
    },
    {
        "code": "def linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct linear search implementation",
        "error_location": None,
        "fix": None,
    },
    # Incorrect Import
    {
        "code": "import math\nx = math.sqrt(16)\nprint(x)",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct module import and usage",
        "error_location": None,
        "fix": None,
    },
    {
        "code": "from os import path\nfile_path = path.join('folder', 'file.txt')",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct selective import",
        "error_location": None,
        "fix": None,
    },
    # State Management Issues
    {
        "code": "counter = 0\ndef increment():\n    counter += 1\n    return counter",
        "category": "logic_error",
        "error_type": "scope_issue",
        "severity": "medium",
        "description": "Cannot modify global variable without declaring it",
        "error_location": [27, 40],
        "fix": "Add 'global counter' at start of function",
    },
    {
        "code": "counter = 0\ndef increment():\n    global counter\n    counter += 1\n    return counter",
        "category": "correct",
        "error_type": None,
        "severity": None,
        "description": "Correct global variable modification",
        "error_location": None,
        "fix": None,
    },
]


def generate_dataset(samples: List[Dict] = None, output_file: str = None) -> Dict:
    """
    Generate a formatted dataset from code samples

    Args:
        samples: List of code sample dictionaries
        output_file: Optional file path to save dataset as JSON

    Returns:
        Dictionary with dataset statistics and samples
    """
    if samples is None:
        samples = CODE_SAMPLES

    dataset = {
        "metadata": {
            "total_samples": len(samples),
            "categories": {},
            "error_types": {},
            "severity_levels": {},
        },
        "samples": samples,
    }

    # Calculate statistics
    for sample in samples:
        category = sample.get("category")
        error_type = sample.get("error_type")
        severity = sample.get("severity")

        if category:
            dataset["metadata"]["categories"][category] = (
                dataset["metadata"]["categories"].get(category, 0) + 1
            )
        if error_type:
            dataset["metadata"]["error_types"][error_type] = (
                dataset["metadata"]["error_types"].get(error_type, 0) + 1
            )
        if severity:
            dataset["metadata"]["severity_levels"][severity] = (
                dataset["metadata"]["severity_levels"].get(severity, 0) + 1
            )

    if output_file:
        os.makedirs(
            os.path.dirname(output_file) if os.path.dirname(output_file) else ".",
            exist_ok=True,
        )
        with open(output_file, "w") as f:
            json.dump(dataset, f, indent=2)
        print(f"Dataset saved to {output_file}")

    return dataset


def get_samples_by_category(category: str, samples: List[Dict] = None) -> List[Dict]:
    """Get all samples of a specific category"""
    if samples is None:
        samples = CODE_SAMPLES
    return [s for s in samples if s.get("category") == category]


def get_training_test_split(
    samples: List[Dict] = None, test_ratio: float = 0.2
) -> Tuple[List[Dict], List[Dict]]:
    """Split dataset into training and test sets"""
    if samples is None:
        samples = CODE_SAMPLES

    split_idx = int(len(samples) * (1 - test_ratio))
    return samples[:split_idx], samples[split_idx:]


if __name__ == "__main__":
    # Generate and save dataset
    dataset = generate_dataset(output_file="dataset/code_error_dataset.json")

    # Print statistics
    print("\n=== Dataset Statistics ===")
    print(f"Total samples: {dataset['metadata']['total_samples']}")
    print("\nCategories:")
    for cat, count in dataset["metadata"]["categories"].items():
        print(f"  {cat}: {count}")
    print("\nError Types:")
    for err, count in dataset["metadata"]["error_types"].items():
        print(f"  {err}: {count}")
    print("\nSeverity Levels:")
    for sev, count in dataset["metadata"]["severity_levels"].items():
        print(f"  {sev}: {count}")
