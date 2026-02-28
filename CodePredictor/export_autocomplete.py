"""Export autocomplete suggestions from the CodePredictor dataset.

This script generates two files (binary pickle and JSON) in the frontend public assets
so the editor can load suggestions quickly.
"""
import os
import pickle
import json
from pathlib import Path

ROOT = Path(__file__).parent
DATA_PKL = ROOT / 'dataset' / 'huge_dataset.pkl'
OUT_DIR = Path(__file__).parent.parent / 'Frontend' / 'Public' / 'assets'
OUT_DIR.mkdir(parents=True, exist_ok=True)

def load_sequences():
    if DATA_PKL.exists():
        with open(DATA_PKL, 'rb') as f:
            return pickle.load(f)
    # fallback: scan dataset folder for text files
    ds = []
    dataset_folder = ROOT / 'dataset'
    if dataset_folder.exists():
        for p in dataset_folder.rglob('*.txt'):
            try:
                with open(p, 'r', encoding='utf8', errors='ignore') as f:
                    ds.append({'code': f.read()})
            except Exception:
                continue
    return ds

def build_prefix_map(sequences, max_suggestions=10):
    from collections import Counter, defaultdict
    counters = defaultdict(Counter)

    for seq in sequences:
        code = seq.get('code', '')
        # simple tokenization by whitespace and common separators
        tokens = []
        cur = ''
        for ch in code:
            if ch.isalnum() or ch == '_':
                cur += ch
            else:
                if cur:
                    tokens.append(cur)
                    cur = ''
        if cur:
            tokens.append(cur)

        for tok in tokens:
            # add counts for all prefixes up to length 20
            for i in range(1, min(len(tok), 20) + 1):
                pref = tok[:i].lower()
                counters[pref][tok] += 1

    # convert counters to ranked lists
    prefix_map = {}
    for pref, counter in counters.items():
        most = [t for t, _ in counter.most_common(max_suggestions)]
        prefix_map[pref] = most

    return prefix_map

def main():
    sequences = load_sequences()
    print(f"Loaded {len(sequences)} sequences for autocomplete generation")
    prefix_map = build_prefix_map(sequences)

    bin_path = OUT_DIR / 'autocomplete.bin'
    json_path = OUT_DIR / 'autocomplete.json'

    with open(bin_path, 'wb') as f:
        pickle.dump(prefix_map, f)
    with open(json_path, 'w', encoding='utf8') as f:
        json.dump(prefix_map, f)

    print(f"Wrote {len(prefix_map)} prefixes to:\n  {bin_path}\n  {json_path}")

if __name__ == '__main__':
    main()
