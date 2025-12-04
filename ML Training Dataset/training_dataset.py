import random

# Training dataset for RL code testing
# Each entry contains a code snippet, possible inputs, expected outputs, and description

CODE_TESTING_DATASET = [
    {
        'description': 'Simple addition function',
        'code': '''
def add_numbers(a, b):
    return a + b

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    result = add_numbers(a, b)
    print(result)
''',
        'possible_inputs': ['1\n2', '5\n3', '10\n20', '0\n0', '100\n200', 'a\n2', '1\nb', '1.5\n2'],
        'expected_outputs': {
            '1\n2': '3',
            '5\n3': '8',
            '10\n20': '30',
            '0\n0': '0',
            '100\n200': '300'
        }
    },
    {
        'description': 'Division function with zero division check',
        'code': '''
def divide_numbers(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

if __name__ == "__main__":
    a = float(input())
    b = float(input())
    result = divide_numbers(a, b)
    print(result)
''',
        'possible_inputs': ['10\n2', '15\n3', '100\n0', '0\n5', '7\n0', '20\n4', 'a\n2'],
        'expected_outputs': {
            '10\n2': '5.0',
            '15\n3': '5.0',
            '0\n5': '0.0',
            '20\n4': '5.0'
        }
    },
    {
        'description': 'Factorial function',
        'code': '''
def factorial(n):
    if n < 0:
        raise ValueError("Factorial not defined for negative numbers")
    if n == 0:
        return 1
    return n * factorial(n - 1)

if __name__ == "__main__":
    n = int(input())
    result = factorial(n)
    print(result)
''',
        'possible_inputs': ['0', '1', '5', '10', '-1', '20', 'a'],
        'expected_outputs': {
            '0': '1',
            '1': '1',
            '5': '120',
            '10': '3628800'
        }
    },
    {
        'description': 'String reversal function',
        'code': '''
def reverse_string(s):
    return s[::-1]

if __name__ == "__main__":
    s = input()
    result = reverse_string(s)
    print(result)
''',
        'possible_inputs': ['hello', 'world', 'python', '', 'a', '12345'],
        'expected_outputs': {
            'hello': 'olleh',
            'world': 'dlrow',
            'python': 'nohtyp',
            '': '',
            'a': 'a',
            '12345': '54321'
        }
    },
    {
        'description': 'List sorting function',
        'code': '''
def sort_list(nums):
    return sorted(nums)

if __name__ == "__main__":
    nums = list(map(int, input().split()))
    result = sort_list(nums)
    print(' '.join(map(str, result)))
''',
        'possible_inputs': ['3 1 4 1 5', '9 2 7', '1', '', 'a b c'],
        'expected_outputs': {
            '3 1 4 1 5': '1 1 3 4 5',
            '9 2 7': '2 7 9',
            '1': '1'
        }
    }
]

def get_random_sample():
    """Get a random sample from the dataset"""
    return random.choice(CODE_TESTING_DATASET)

def get_all_samples():
    """Get all samples from the dataset"""
    return CODE_TESTING_DATASET

def add_sample(description, code, possible_inputs, expected_outputs):
    """Add a new sample to the dataset"""
    CODE_TESTING_DATASET.append({
        'description': description,
        'code': code,
        'possible_inputs': possible_inputs,
        'expected_outputs': expected_outputs
    })

if __name__ == "__main__":
    print(f"Dataset contains {len(CODE_TESTING_DATASET)} samples")
    sample = get_random_sample()
    print(f"Sample: {sample['description']}")
    print(f"Code length: {len(sample['code'])} characters")
    print(f"Possible inputs: {len(sample['possible_inputs'])}")
    print(f"Expected outputs: {len(sample['expected_outputs'])}")
