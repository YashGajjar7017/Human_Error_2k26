"""
LSTM-based Code Prediction Model
Learns from user typing patterns to predict next token/word.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Sequential
import json
from typing import List, Tuple, Dict
from .tokenizer import CodeTokenizer


class CodePredictorModel:
    """LSTM model for predicting next code tokens."""
    
    def __init__(
        self,
        vocab_size: int = 5000,
        seq_length: int = 50,
        embedding_dim: int = 256,
        lstm_units: int = 512,
        num_layers: int = 2,
        dropout_rate: float = 0.3,
        learning_rate: float = 0.001
    ):
        """
        Args:
            vocab_size: Size of vocabulary
            seq_length: Length of input sequences
            embedding_dim: Embedding dimension
            lstm_units: LSTM units per layer
            num_layers: Number of LSTM layers
            dropout_rate: Dropout rate
            learning_rate: Learning rate
        """
        self.vocab_size = vocab_size
        self.seq_length = seq_length
        self.embedding_dim = embedding_dim
        self.lstm_units = lstm_units
        self.num_layers = num_layers
        self.dropout_rate = dropout_rate
        self.learning_rate = learning_rate
        
        self.model = self._build_model()
        self.tokenizer = CodeTokenizer(vocab_size=vocab_size, max_tokens=seq_length)
        
        self.training_history = {'loss': [], 'perplexity': []}
    
    def _build_model(self) -> keras.Model:
        """Build LSTM architecture."""
        model = Sequential()
        
        # Embedding layer
        model.add(layers.Embedding(
            input_dim=self.vocab_size,
            output_dim=self.embedding_dim,
            mask_zero=True,
            input_length=self.seq_length
        ))
        model.add(layers.Dropout(self.dropout_rate))
        
        # LSTM layers
        for i in range(self.num_layers):
            return_sequences = i < self.num_layers - 1
            model.add(layers.LSTM(
                self.lstm_units,
                return_sequences=return_sequences,
                dropout=self.dropout_rate if i < self.num_layers - 1 else 0
            ))
            model.add(layers.Dropout(self.dropout_rate))
        
        # Dense layers
        model.add(layers.Dense(self.lstm_units // 2, activation='relu'))
        model.add(layers.Dropout(self.dropout_rate))
        
        # Output layer
        model.add(layers.Dense(self.vocab_size, activation='softmax'))
        
        # Compile
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.learning_rate),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def prepare_sequences(self, tokens: List[int]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training sequences.
        
        For input [t1, t2, t3, t4, t5]:
        - X: [[t1, t2, t3, t4], [t2, t3, t4, t5]]
        - y: [t5, t6] (next token to predict)
        """
        X, y = [], []
        
        for i in range(len(tokens) - self.seq_length):
            X.append(tokens[i:i + self.seq_length])
            y.append(tokens[i + self.seq_length])
        
        return np.array(X), np.array(y).reshape(-1, 1)
    
    def train(
        self,
        code_samples: List[str],
        epochs: int = 10,
        batch_size: int = 32,
        validation_split: float = 0.2
    ) -> Dict:
        """Train model on code samples."""
        print(f"\n{'='*60}")
        print(f"Training Code Predictor Model")
        print(f"{'='*60}")
        
        # Build tokenizer
        print("Building tokenizer...")
        self.tokenizer.build_vocab(code_samples, min_freq=1)
        
        # Prepare training data
        print(f"Preparing {len(code_samples)} code samples...")
        all_X = []
        all_y = []
        
        for code in code_samples:
            tokens = self.tokenizer.tokenize(code)
            ids = self.tokenizer.encode(tokens)
            
            if len(ids) > self.seq_length:
                X, y = self.prepare_sequences(ids)
                all_X.append(X)
                all_y.append(y)
        
        X_train = np.vstack(all_X) if all_X else np.array([]).reshape(0, self.seq_length)
        y_train = np.vstack(all_y) if all_y else np.array([]).reshape(0, 1)
        
        if len(X_train) == 0:
            print("✗ No training sequences generated!")
            return {}
        
        print(f"✓ Training data prepared: {X_train.shape} samples")
        
        # Train
        print(f"Training for {epochs} epochs...")
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        self.training_history = {
            'loss': history.history['loss'],
            'accuracy': history.history['accuracy']
        }
        
        print("✓ Training complete!")
        
        return history.history
    
    def predict_next_token(self, partial_code: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """
        Predict next token(s) given partial code.
        
        Args:
            partial_code: Code snippet so far
            top_k: Return top K predictions
        
        Returns:
            List of (token, probability) tuples
        """
        # Tokenize and encode
        tokens = self.tokenizer.tokenize(partial_code)
        ids = self.tokenizer.encode(tokens)
        
        # Pad or truncate to seq_length
        if len(ids) < self.seq_length:
            ids = [self.tokenizer.token_to_id['<PAD>']] * (self.seq_length - len(ids)) + ids
        else:
            ids = ids[-self.seq_length:]
        
        # Predict
        input_seq = np.array([ids])
        predictions = self.model.predict(input_seq, verbose=0)[0]
        
        # Get top K
        top_indices = np.argsort(predictions)[-top_k:][::-1]
        results = []
        
        for idx in top_indices:
            token = self.tokenizer.id_to_token.get(idx, '<UNK>')
            prob = float(predictions[idx])
            results.append((token, prob))
        
        return results
    
    def predict_sequence(self, partial_code: str, length: int = 5) -> str:
        """Generate next N tokens auto-regressively."""
        current_code = partial_code
        
        for _ in range(length):
            predictions = self.predict_next_token(current_code, top_k=1)
            if not predictions:
                break
            
            next_token = predictions[0][0]
            
            if next_token in ['<END>', '<PAD>']:
                break
            
            # Reconstruct readable token
            if next_token.startswith('<KEYWORD:'):
                next_token = next_token[9:-1]
            elif next_token == '<STR>':
                next_token = '"string"'
            elif next_token == '<NUM>':
                next_token = '0'
            elif next_token == '<COMMENT>':
                next_token = '# comment'
            
            # Add space if needed
            if current_code and not current_code[-1] in '([{. \n':
                current_code += ' '
            
            current_code += next_token
        
        return current_code
    
    def save(self, filepath: str):
        """Save model and tokenizer."""
        base = filepath.replace('.h5', '')
        self.model.save(f'{base}.h5')
        self.tokenizer.save(f'{base}_tokenizer.json')
        
        with open(f'{base}_history.json', 'w') as f:
            json.dump(self.training_history, f, indent=2)
        
        print(f"✓ Model saved to {filepath}")
    
    def load(self, filepath: str):
        """Load model and tokenizer."""
        base = filepath.replace('.h5', '')
        self.model = keras.models.load_model(f'{base}.h5')
        self.tokenizer.load(f'{base}_tokenizer.json')
        
        try:
            with open(f'{base}_history.json', 'r') as f:
                self.training_history = json.load(f)
        except FileNotFoundError:
            pass
        
        print(f"✓ Model loaded from {filepath}")


class CodeCompletionCache:
    """Cache predictions for performance."""
    
    def __init__(self, max_size: int = 1000):
        self.cache = {}
        self.max_size = max_size
    
    def get(self, key: str) -> List[Tuple[str, float]]:
        """Get cached prediction."""
        return self.cache.get(key)
    
    def put(self, key: str, value: List[Tuple[str, float]]):
        """Cache prediction."""
        if len(self.cache) >= self.max_size:
            # Remove oldest (simple FIFO)
            self.cache.pop(next(iter(self.cache)))
        
        self.cache[key] = value
    
    def clear(self):
        """Clear cache."""
        self.cache.clear()
