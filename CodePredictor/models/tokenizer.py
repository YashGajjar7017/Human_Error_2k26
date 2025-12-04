"""
Code Tokenizer & Vocabulary Manager
Handles tokenization of code into meaningful tokens for prediction.
"""

import json
import os
from typing import List, Dict, Tuple
from collections import Counter
import pickle


class CodeTokenizer:
    """Tokenizes code into logical tokens for ML model."""
    
    # Python/JavaScript keywords
    KEYWORDS = {
        'if', 'else', 'elif', 'for', 'while', 'def', 'class', 'return', 'import',
        'from', 'as', 'try', 'except', 'finally', 'with', 'pass', 'break', 'continue',
        'lambda', 'yield', 'raise', 'assert', 'del', 'and', 'or', 'not', 'in', 'is',
        'True', 'False', 'None', 'async', 'await', 'function', 'const', 'let', 'var',
        'switch', 'case', 'default', 'do', 'throw', 'async', 'await', 'constructor'
    }
    
    # Special tokens
    SPECIAL_TOKENS = {
        '<PAD>': 0,
        '<START>': 1,
        '<END>': 2,
        '<UNK>': 3,
        '<NUM>': 4,
        '<STR>': 5,
        '<COMMENT>': 6,
        '<OPERATOR>': 7,
        '<INDENT>': 8,
        '<NEWLINE>': 9
    }
    
    def __init__(self, vocab_size: int = 5000, max_tokens: int = None):
        """
        Args:
            vocab_size: Maximum vocabulary size
            max_tokens: Maximum sequence length
        """
        self.vocab_size = vocab_size
        self.max_tokens = max_tokens
        
        self.token_to_id = dict(self.SPECIAL_TOKENS)
        self.id_to_token = {v: k for k, v in self.token_to_id.items()}
        self.token_freq = Counter()
        
        self._next_id = max(self.SPECIAL_TOKENS.values()) + 1
    
    def tokenize(self, code: str) -> List[str]:
        """
        Tokenize code string into logical tokens.
        
        Handles:
        - Keywords
        - Identifiers
        - Numbers
        - Strings
        - Operators
        - Comments
        - Whitespace/indentation
        """
        tokens = []
        i = 0
        
        while i < len(code):
            # Skip whitespace (but track newlines and indentation)
            if code[i] == '\n':
                tokens.append('<NEWLINE>')
                i += 1
                # Count indentation
                indent_count = 0
                while i < len(code) and code[i] == ' ':
                    indent_count += 1
                    i += 1
                if indent_count > 0:
                    tokens.append('<INDENT>')
                continue
            
            if code[i] == ' ' or code[i] == '\t':
                i += 1
                continue
            
            # Comments
            if i + 1 < len(code) and code[i:i+2] == '//':
                while i < len(code) and code[i] != '\n':
                    i += 1
                tokens.append('<COMMENT>')
                continue
            
            if code[i] == '#':
                while i < len(code) and code[i] != '\n':
                    i += 1
                tokens.append('<COMMENT>')
                continue
            
            # Strings
            if code[i] in ['"', "'", '`']:
                quote = code[i]
                i += 1
                while i < len(code) and code[i] != quote:
                    if code[i] == '\\':
                        i += 2
                    else:
                        i += 1
                if i < len(code):
                    i += 1
                tokens.append('<STR>')
                continue
            
            # Numbers
            if code[i].isdigit():
                while i < len(code) and (code[i].isdigit() or code[i] == '.'):
                    i += 1
                tokens.append('<NUM>')
                continue
            
            # Operators and punctuation
            if code[i] in '+-*/%=<>!&|^~()[]{},.;:':
                op = code[i]
                i += 1
                
                # Check for multi-char operators
                if i < len(code) and (code[i:i+1] in '=<>|-') and op in '<>=!+-|&':
                    op += code[i]
                    i += 1
                
                tokens.append(op)
                continue
            
            # Identifiers and keywords
            if code[i].isalpha() or code[i] == '_':
                token = ''
                while i < len(code) and (code[i].isalnum() or code[i] == '_'):
                    token += code[i]
                    i += 1
                
                if token in self.KEYWORDS:
                    tokens.append(f'<KEYWORD:{token}>')
                else:
                    tokens.append(token)
                continue
            
            # Unknown character
            i += 1
        
        return tokens
    
    def build_vocab(self, code_samples: List[str], min_freq: int = 1):
        """Build vocabulary from code samples."""
        # Tokenize all samples
        for code in code_samples:
            tokens = self.tokenize(code)
            for token in tokens:
                self.token_freq[token] += 1
        
        # Sort by frequency
        sorted_tokens = sorted(
            self.token_freq.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Add to vocab (keep special tokens)
        for token, freq in sorted_tokens[:self.vocab_size - len(self.SPECIAL_TOKENS)]:
            if freq >= min_freq and token not in self.token_to_id:
                self.token_to_id[token] = self._next_id
                self.id_to_token[self._next_id] = token
                self._next_id += 1
        
        print(f"✓ Vocabulary built: {len(self.token_to_id)} tokens")
    
    def encode(self, tokens: List[str]) -> List[int]:
        """Convert tokens to IDs."""
        ids = []
        for token in tokens:
            if token in self.token_to_id:
                ids.append(self.token_to_id[token])
            else:
                ids.append(self.token_to_id['<UNK>'])
        
        # Truncate or pad
        if self.max_tokens and len(ids) > self.max_tokens:
            ids = ids[:self.max_tokens]
        
        return ids
    
    def decode(self, ids: List[int]) -> List[str]:
        """Convert IDs back to tokens."""
        tokens = []
        for id_ in ids:
            if id_ in self.id_to_token:
                tokens.append(self.id_to_token[id_])
            else:
                tokens.append('<UNK>')
        return tokens
    
    def tokens_to_code(self, tokens: List[str]) -> str:
        """Reconstruct code from tokens."""
        code = ""
        for token in tokens:
            if token == '<NEWLINE>':
                code += '\n'
            elif token == '<INDENT>':
                code += '    '
            elif token == '<STR>':
                code += '"string"'
            elif token == '<NUM>':
                code += '0'
            elif token == '<COMMENT>':
                code += '# comment'
            elif token.startswith('<KEYWORD:'):
                keyword = token[9:-1]
                code += keyword + ' '
            elif token in ['(', '[', '{', ',', ';']:
                code += token
            elif token in [')', ']', '}']:
                code += token
            else:
                code += token + ' '
        
        return code.strip()
    
    def save(self, filepath: str):
        """Save tokenizer to file."""
        data = {
            'vocab_size': self.vocab_size,
            'max_tokens': self.max_tokens,
            'token_to_id': self.token_to_id,
            'id_to_token': {str(k): v for k, v in self.id_to_token.items()},
            'token_freq': dict(self.token_freq),
            'next_id': self._next_id
        }
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✓ Tokenizer saved to {filepath}")
    
    def load(self, filepath: str):
        """Load tokenizer from file."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        self.token_to_id = data['token_to_id']
        self.id_to_token = {int(k): v for k, v in data['id_to_token'].items()}
        self.token_freq = Counter(data['token_freq'])
        self._next_id = data['next_id']
        print(f"✓ Tokenizer loaded from {filepath}")
