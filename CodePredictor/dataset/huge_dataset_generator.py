"""
Huge Dataset Generator for CodePredictor
Generates 50k+ code samples across multiple languages with realistic patterns
"""

import os
import json
import random
import pickle
from pathlib import Path
from collections import defaultdict

# Python code patterns and templates
PYTHON_PATTERNS = {
    'functions': [
        'def {name}({params}):\n    """' + '{docstring}"""\n    {body}',
        'def {name}({params}):\n    return {body}',
        'async def {name}({params}):\n    {body}',
        '@property\n    def {name}(self):\n        return {body}',
        '@staticmethod\n    def {name}({params}):\n        return {body}',
    ],
    'classes': [
        'class {name}:\n    def __init__(self, {params}):\n        {init_body}',
        'class {name}(BaseClass):\n    def __init__(self, {params}):\n        super().__init__()\n        {init_body}',
        'class {name}({base}):\n    {methods}',
    ],
    'loops': [
        'for {var} in {iterable}:\n    {body}',
        'while {condition}:\n    {body}',
        'for {i} in range({n}):\n    {body}',
    ],
    'conditionals': [
        'if {condition}:\n    {body}',
        'if {condition}:\n    {if_body}\nelse:\n    {else_body}',
        'if {cond1}:\n    {b1}\nelif {cond2}:\n    {b2}\nelse:\n    {b3}',
    ],
    'comprehensions': [
        '[{expr} for {var} in {iterable}]',
        '[{expr} for {var} in {iterable} if {condition}]',
        '{{{key}: {val} for {var} in {iterable}}}',
    ],
    'error_handling': [
        'try:\n    {body}\nexcept {exception}:\n    {handler}',
        'try:\n    {body}\nexcept {exc1}:\n    {h1}\nexcept {exc2}:\n    {h2}',
        'try:\n    {body}\nfinally:\n    {cleanup}',
    ],
    'with_statements': [
        'with open({file}) as f:\n    {body}',
        'with {context} as {var}:\n    {body}',
    ],
}

# JavaScript patterns
JAVASCRIPT_PATTERNS = {
    'functions': [
        'function {name}({params}) {{\n  {body}\n}}',
        'const {name} = ({params}) => {{\n  {body}\n}}',
        'async function {name}({params}) {{\n  {body}\n}}',
        'const {name} = function({params}) {{\n  {body}\n}}',
    ],
    'classes': [
        'class {name} {{\n  constructor({params}) {{\n    {init}\n  }}\n}}',
        'class {name} extends {base} {{\n  constructor({params}) {{\n    super();\n    {init}\n  }}\n}}',
    ],
    'loops': [
        'for (let {i} = 0; {i} < {n}; {i}++) {{\n  {body}\n}}',
        'for (const {var} of {iterable}) {{\n  {body}\n}}',
        '{iterable}.forEach({var} => {{\n  {body}\n}});',
    ],
    'conditionals': [
        'if ({condition}) {{\n  {body}\n}}',
        'if ({cond}) {{\n  {if_body}\n}} else {{\n  {else_body}\n}}',
        '{condition} ? {true_val} : {false_val}',
    ],
    'async': [
        'async function {name}() {{\n  const result = await {promise};\n  {body}\n}}',
        'fetch({url})\n  .then(response => response.json())\n  .then(data => {{\n    {body}\n  }})',
    ],
}

# Java patterns
JAVA_PATTERNS = {
    'classes': [
        'public class {name} {{\n  private {type} {field};\n  {methods}\n}}',
        'public class {name} extends {base} {{\n  public {name}({params}) {{\n    {init}\n  }}\n}}',
    ],
    'methods': [
        'public {return_type} {name}({params}) {{\n  {body}\n}}',
        'private {return_type} {name}({params}) throws {exception} {{\n  {body}\n}}',
    ],
    'loops': [
        'for (int {i} = 0; {i} < {n}; {i}++) {{\n  {body}\n}}',
        'for ({type} {var} : {collection}) {{\n  {body}\n}}',
    ],
}

# C++ patterns
CPP_PATTERNS = {
    'functions': [
        '{return_type} {name}({params}) {{\n  {body}\n}}',
        'void {name}({params}) {{\n  {body}\n}}',
        'template<typename T>\n{return_type} {name}({params}) {{\n  {body}\n}}',
    ],
    'classes': [
        'class {name} {{\npublic:\n  {name}({params});\n  {methods}\nprivate:\n  {members}\n}};',
    ],
}

# Common variable and function names
VARIABLE_NAMES = ['x', 'y', 'z', 'n', 'i', 'j', 'k', 'value', 'count', 'index', 'data', 'result', 'temp', 'item', 'element']
FUNCTION_NAMES = ['calculate', 'process', 'fetch', 'handle', 'render', 'parse', 'validate', 'transform', 'initialize', 'execute']
CLASS_NAMES = ['Handler', 'Manager', 'Service', 'Controller', 'Model', 'View', 'Factory', 'Builder', 'Cache']

# Common keywords and operations
KEYWORDS_PYTHON = ['def', 'class', 'if', 'else', 'for', 'while', 'return', 'import', 'from', 'try', 'except', 'with', 'async', 'await', 'lambda', 'yield']
KEYWORDS_JS = ['function', 'class', 'if', 'else', 'for', 'while', 'const', 'let', 'var', 'return', 'async', 'await', 'try', 'catch', 'new']

# Operations and common patterns
OPERATIONS = ['+', '-', '*', '/', '%', '==', '!=', '<', '>', '<=', '>=', '&&', '||', 'and', 'or', 'not']

class HugeDatasetGenerator:
    """Generate massive dataset for code prediction"""
    
    def __init__(self, output_dir='dataset', num_samples=50000):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.num_samples = num_samples
        self.dataset = []
        self.stats = defaultdict(int)
    
    def generate_python_snippet(self):
        """Generate realistic Python code snippets"""
        category = random.choice(list(PYTHON_PATTERNS.keys()))
        template = random.choice(PYTHON_PATTERNS[category])
        
        name = random.choice(FUNCTION_NAMES)
        param = random.choice(VARIABLE_NAMES)
        body = f'{param} = {random.choice(VARIABLE_NAMES)} + 1'
        
        snippet = template.format(
            name=name,
            params=param,
            body=body,
            docstring='Process data',
            base='object',
            init_body=f'self.{random.choice(VARIABLE_NAMES)} = {param}',
            var=random.choice(VARIABLE_NAMES),
            iterable='items',
            condition=f'{param} > 0',
            exception='Exception',
            handler='pass',
            file="'data.txt'",
            context='lock',
            cleanup='pass',
        )
        return snippet, 'python'
    
    def generate_javascript_snippet(self):
        """Generate realistic JavaScript code snippets"""
        category = random.choice(list(JAVASCRIPT_PATTERNS.keys()))
        template = random.choice(JAVASCRIPT_PATTERNS[category])
        
        name = random.choice(FUNCTION_NAMES)
        param = random.choice(VARIABLE_NAMES)
        body = f'return {param} * 2;'
        
        snippet = template.format(
            name=name,
            params=param,
            body=body,
            init=f'this.{random.choice(VARIABLE_NAMES)} = {param};',
            base='EventEmitter',
            i='i',
            n='10',
            var=random.choice(VARIABLE_NAMES),
            iterable='array',
            cond='true',
            if_body='console.log("yes");',
            else_body='console.log("no");',
            condition='condition',
            true_val='value1',
            false_val='value2',
            url="'api/data'",
            promise='fetch(url)',
        )
        return snippet, 'javascript'
    
    def generate_java_snippet(self):
        """Generate realistic Java code snippets"""
        category = random.choice(list(JAVA_PATTERNS.keys()))
        template = random.choice(JAVA_PATTERNS[category])
        
        name = random.choice(CLASS_NAMES)
        return_type = random.choice(['int', 'String', 'void', 'boolean'])
        param = random.choice(VARIABLE_NAMES)
        
        snippet = template.format(
            name=name,
            base='Object',
            params=f'{return_type} {param}',
            return_type=return_type,
            body='return null;',
            init='this.value = 0;',
            field='value',
            type='int',
            methods='public int getValue() { return value; }',
            exception='IOException',
            n='10',
            i='i',
            var=param,
            collection='list',
        )
        return snippet, 'java'
    
    def generate_cpp_snippet(self):
        """Generate realistic C++ code snippets"""
        category = random.choice(list(CPP_PATTERNS.keys()))
        template = random.choice(CPP_PATTERNS[category])
        
        return_type = random.choice(['int', 'void', 'double', 'string'])
        name = random.choice(FUNCTION_NAMES)
        
        snippet = template.format(
            return_type=return_type,
            name=name,
            params='int x',
            body='return x;',
            members='int value;',
            methods='int getValue();',
        )
        return snippet, 'cpp'
    
    def create_training_sequences(self):
        """Create training sequences from snippets"""
        sequences = []
        
        for _ in range(self.num_samples // 4):
            py_snippet, lang = self.generate_python_snippet()
            sequences.append({'code': py_snippet, 'language': lang, 'tokens': py_snippet.split()})
            self.stats['python'] += 1
        
        for _ in range(self.num_samples // 4):
            js_snippet, lang = self.generate_javascript_snippet()
            sequences.append({'code': js_snippet, 'language': lang, 'tokens': js_snippet.split()})
            self.stats['javascript'] += 1
        
        for _ in range(self.num_samples // 4):
            java_snippet, lang = self.generate_java_snippet()
            sequences.append({'code': java_snippet, 'language': lang, 'tokens': java_snippet.split()})
            self.stats['java'] += 1
        
        for _ in range(self.num_samples // 4):
            cpp_snippet, lang = self.generate_cpp_snippet()
            sequences.append({'code': cpp_snippet, 'language': lang, 'tokens': cpp_snippet.split()})
            self.stats['cpp'] += 1
        
        return sequences
    
    def save_dataset(self):
        """Save dataset to files"""
        sequences = self.create_training_sequences()
        
        # Save as JSON
        json_path = self.output_dir / 'huge_dataset.json'
        with open(json_path, 'w') as f:
            json.dump(sequences, f, indent=2)
        print(f"✓ Saved JSON dataset: {json_path} ({len(sequences)} samples)")
        
        # Save as pickle (faster loading)
        pickle_path = self.output_dir / 'huge_dataset.pkl'
        with open(pickle_path, 'wb') as f:
            pickle.dump(sequences, f)
        print(f"✓ Saved pickle dataset: {pickle_path}")
        
        # Save stats
        stats_path = self.output_dir / 'dataset_stats.json'
        with open(stats_path, 'w') as f:
            json.dump(dict(self.stats), f, indent=2)
        print(f"✓ Dataset stats: {dict(self.stats)}")
        
        return sequences

def generate_huge_dataset(num_samples=50000):
    """Main function to generate dataset"""
    print(f"\n{'='*60}")
    print(f"Generating Huge Dataset ({num_samples} samples)")
    print(f"{'='*60}\n")
    
    generator = HugeDatasetGenerator(num_samples=num_samples)
    sequences = generator.save_dataset()
    
    print(f"\n✓ Dataset generation complete!")
    print(f"  Total samples: {len(sequences)}")
    print(f"  Languages: {list(generator.stats.keys())}")
    print(f"\n{'='*60}\n")
    
    return sequences

if __name__ == '__main__':
    generate_huge_dataset(50000)
