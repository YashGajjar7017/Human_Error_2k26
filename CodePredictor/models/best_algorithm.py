"""
Best Algorithm post-processing for model predictions.
Provides top-k, nucleus (top-p) sampling and a simple beam search.
"""
import numpy as np
from typing import List, Tuple


def top_k_logits(logits: np.ndarray, k: int) -> np.ndarray:
    """Zero out all logits except top-k (by index)."""
    if k <= 0:
        return logits
    idx = np.argpartition(-logits, k - 1)[:k]
    mask = np.ones_like(logits, dtype=bool)
    mask[idx] = False
    filtered = np.copy(logits)
    filtered[mask] = -np.inf
    return filtered


def softmax(x: np.ndarray) -> np.ndarray:
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()


def top_k_sampling(probs: np.ndarray, k: int) -> List[Tuple[int, float]]:
    """Return top-k token indices and probabilities from probability vector."""
    if k <= 0:
        k = min(10, probs.size)
    idx = np.argsort(probs)[-k:][::-1]
    return [(int(i), float(probs[i])) for i in idx]


def nucleus_sampling(probs: np.ndarray, p: float = 0.9) -> List[Tuple[int, float]]:
    """Return smallest set of tokens whose cumulative prob >= p."""
    sorted_idx = np.argsort(probs)[::-1]
    cum = 0.0
    selected = []
    for i in sorted_idx:
        cum += probs[i]
        selected.append((int(i), float(probs[i])))
        if cum >= p:
            break
    return selected


def beam_search_step(logits: np.ndarray, beam_width: int = 3) -> List[Tuple[int, float]]:
    """Select top beam_width tokens (simple single-step beam search).
    For full beam search we'd expand sequences; here we keep it simple for next-token selection.
    """
    probs = softmax(logits)
    return top_k_sampling(probs, beam_width)


def choose_best_indices_from_logits(logits: np.ndarray, method: str = 'top_k', k: int = 5, p: float = 0.9) -> List[Tuple[int, float]]:
    """Given raw logits vector, apply selection method and return (idx, prob) list."""
    if logits is None:
        return []
    logits = np.asarray(logits, dtype=np.float64)
    probs = softmax(logits)

    if method == 'top_k':
        return top_k_sampling(probs, k)
    if method == 'nucleus' or method == 'top_p':
        return nucleus_sampling(probs, p)
    if method == 'beam':
        return beam_search_step(logits, beam_width=k)

    # default
    return top_k_sampling(probs, k)
