"""
Code Error Detection ML Model
Uses LSTM and CNN neural networks to detect coding errors
"""

import numpy as np
import json
import pickle
from typing import Tuple, List, Dict
from tensorflow import keras
from tensorflow.keras import layers, models
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
import os


class CodeErrorDetector:
    """ML Model for detecting coding errors"""

    def __init__(self, vocab_size: int = 5000, max_length: int = 500):
        """
        Initialize the model

        Args:
            vocab_size: Size of vocabulary for tokenization
            max_length: Maximum code length to process
        """
        self.vocab_size = vocab_size
        self.max_length = max_length
        self.model = None
        self.tokenizer = None
        self.label_encoder = None
        self.char_to_idx = {}
        self.idx_to_char = {}

        self._build_char_mapping()

    def _build_char_mapping(self):
        """Build character to index mapping"""
        # Include common characters in code
        chars = set()
        chars.update("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
        chars.update("()[]{}.,;:'\"=+-*/<>!&|~?:\\")
        chars.update("\n\t ")

        self.char_to_idx = {char: idx for idx, char in enumerate(sorted(chars))}
        self.idx_to_char = {idx: char for char, idx in self.char_to_idx.items()}

    def _encode_code(self, code: str) -> List[int]:
        """Encode code string to numerical sequence"""
        encoded = []
        for char in code:
            if char in self.char_to_idx:
                encoded.append(self.char_to_idx[char])
            else:
                encoded.append(self.char_to_idx.get(" ", 0))  # Default to space

        # Pad or truncate to max_length
        if len(encoded) < self.max_length:
            encoded.extend([0] * (self.max_length - len(encoded)))
        else:
            encoded = encoded[: self.max_length]

        return encoded

    def _decode_code(self, encoded: List[int]) -> str:
        """Decode numerical sequence back to code string"""
        decoded = ""
        for idx in encoded:
            if idx in self.idx_to_char:
                decoded += self.idx_to_char[idx]
        return decoded.strip()

    def build_model(self, input_shape: Tuple = None) -> models.Model:
        """Build the neural network model"""
        if input_shape is None:
            input_shape = (self.max_length,)

        model = models.Sequential(
            [
                # Embedding layer
                layers.Embedding(
                    len(self.char_to_idx) + 1, 64, input_length=self.max_length
                ),
                # LSTM layers for sequence processing
                layers.LSTM(128, return_sequences=True, dropout=0.2),
                layers.LSTM(64, return_sequences=True, dropout=0.2),
                layers.LSTM(32, dropout=0.2),
                # Dense layers for classification
                layers.Dense(
                    64,
                    activation="relu",
                    kernel_regularizer=keras.regularizers.l2(0.001),
                ),
                layers.Dropout(0.3),
                layers.Dense(
                    32,
                    activation="relu",
                    kernel_regularizer=keras.regularizers.l2(0.001),
                ),
                layers.Dropout(0.3),
                # Output layer (8 categories: correct, syntax_error, type_error, logic_error, etc.)
                layers.Dense(8, activation="softmax"),
            ]
        )

        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss="categorical_crossentropy",
            metrics=["accuracy"],
        )

        self.model = model
        return model

    def build_cnn_model(self) -> models.Model:
        """Build CNN-based model for code analysis"""
        model = models.Sequential(
            [
                layers.Embedding(
                    len(self.char_to_idx) + 1, 64, input_length=self.max_length
                ),
                layers.Conv1D(64, 3, activation="relu", padding="same"),
                layers.MaxPooling1D(2),
                layers.Conv1D(128, 3, activation="relu", padding="same"),
                layers.MaxPooling1D(2),
                layers.Conv1D(256, 3, activation="relu", padding="same"),
                layers.GlobalMaxPooling1D(),
                layers.Dense(256, activation="relu"),
                layers.Dropout(0.3),
                layers.Dense(128, activation="relu"),
                layers.Dropout(0.3),
                layers.Dense(8, activation="softmax"),
            ]
        )

        model.compile(
            optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"]
        )

        self.model = model
        return model

    def prepare_data(self, dataset: Dict) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data for training

        Args:
            dataset: Dataset dictionary from code_error_dataset.py

        Returns:
            X (encoded codes), y (one-hot encoded labels)
        """
        samples = dataset["samples"]
        categories = list(set(s["category"] for s in samples))

        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(categories)

        X = []
        y = []

        for sample in samples:
            code = sample["code"]
            category = sample["category"]

            # Encode code
            encoded = self._encode_code(code)
            X.append(encoded)

            # Encode label
            label_idx = self.label_encoder.transform([category])[0]
            y.append(label_idx)

        X = np.array(X)
        y = keras.utils.to_categorical(np.array(y), num_classes=len(categories))

        return X, y

    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        epochs: int = 10,
        batch_size: int = 32,
        validation_split: float = 0.2,
        verbose: int = 1,
    ) -> Dict:
        """
        Train the model

        Args:
            X: Input data
            y: Target labels
            epochs: Number of training epochs
            batch_size: Batch size
            validation_split: Validation split ratio
            verbose: Verbosity level

        Returns:
            Training history
        """
        if self.model is None:
            self.build_model()

        history = self.model.fit(
            X,
            y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=verbose,
        )

        return history.history

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict:
        """
        Evaluate model performance

        Returns:
            Dictionary with metrics
        """
        y_pred = self.predict(X)
        y_pred_labels = np.argmax(y_pred, axis=1)
        y_true_labels = np.argmax(y, axis=1)

        return {
            "accuracy": accuracy_score(y_true_labels, y_pred_labels),
            "precision": precision_score(
                y_true_labels, y_pred_labels, average="weighted", zero_division=0
            ),
            "recall": recall_score(
                y_true_labels, y_pred_labels, average="weighted", zero_division=0
            ),
            "f1": f1_score(
                y_true_labels, y_pred_labels, average="weighted", zero_division=0
            ),
        }

    def predict(self, code: str = None, X: np.ndarray = None) -> np.ndarray:
        """
        Make prediction on code

        Args:
            code: Code string to analyze
            X: Encoded input array

        Returns:
            Prediction probabilities
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        if code is not None:
            X = np.array([self._encode_code(code)])

        return self.model.predict(X, verbose=0)

    def predict_category(self, code: str) -> Tuple[str, float]:
        """
        Predict error category for code

        Returns:
            Tuple of (category, confidence)
        """
        prediction = self.predict(code)
        category_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][category_idx])
        category = self.label_encoder.inverse_transform([category_idx])[0]

        return category, confidence

    def save_model(self, filepath: str):
        """Save trained model to disk"""
        os.makedirs(
            os.path.dirname(filepath) if os.path.dirname(filepath) else ".",
            exist_ok=True,
        )
        self.model.save(filepath)

        # Save metadata
        metadata = {
            "vocab_size": self.vocab_size,
            "max_length": self.max_length,
            "char_to_idx": self.char_to_idx,
            "idx_to_char": {str(k): v for k, v in self.idx_to_char.items()},
            "label_encoder": list(self.label_encoder.classes_),
        }

        with open(filepath.replace(".h5", "_metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)

        print(f"Model saved to {filepath}")

    def load_model(self, filepath: str):
        """Load trained model from disk"""
        self.model = keras.models.load_model(filepath)

        # Load metadata
        metadata_file = filepath.replace(".h5", "_metadata.json")
        if os.path.exists(metadata_file):
            with open(metadata_file, "r") as f:
                metadata = json.load(f)

            self.vocab_size = metadata["vocab_size"]
            self.max_length = metadata["max_length"]
            self.char_to_idx = metadata["char_to_idx"]
            self.idx_to_char = {int(k): v for k, v in metadata["idx_to_char"].items()}
            self.label_encoder = LabelEncoder()
            self.label_encoder.fit(metadata["label_encoder"])

        print(f"Model loaded from {filepath}")


if __name__ == "__main__":
    print("Code Error Detection Model initialized successfully")
