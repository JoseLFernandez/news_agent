from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

from app.api.models import ArticleMatch, Cluster
from app.utils.similarity import cosine_similarity


_STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "as",
    "by",
    "from",
    "at",
    "is",
    "are",
    "was",
    "were",
    "be",
    "it",
    "this",
    "that",
}


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return [t for t in tokens if t not in _STOPWORDS]


def label_cluster(items: list[ArticleMatch]) -> str:
    # Deterministic heuristic: pick the representative title and extract 2-4 keywords.
    title = next((i.title for i in items if i.title), None) or "Topic"
    toks = _tokenize(title)
    if not toks:
        return "Topic"
    return " ".join(toks[:4])


@dataclass(frozen=True)
class ClusteringService:
    same_story_threshold: float = 0.90
    near_duplicate_threshold: float = 0.97

    def _can_compare(self, a: ArticleMatch, b: ArticleMatch) -> bool:
        return a.embedding is not None and b.embedding is not None

    def dedupe_near_identical(self, items: Iterable[ArticleMatch]) -> list[ArticleMatch]:
        kept: list[ArticleMatch] = []
        for item in items:
            duplicate = False
            for prev in kept:
                if item.url and prev.url and item.url == prev.url:
                    duplicate = True
                    break
                if self._can_compare(item, prev):
                    sim = cosine_similarity(item.embedding or [], prev.embedding or [])
                    if sim >= self.near_duplicate_threshold:
                        duplicate = True
                        break
            if not duplicate:
                kept.append(item)
        return kept

    def cluster(self, items: list[ArticleMatch]) -> list[Cluster]:
        items = self.dedupe_near_identical(items)
        clusters: list[list[ArticleMatch]] = []

        for item in items:
            placed = False
            for c in clusters:
                rep = c[0]
                if self._can_compare(item, rep):
                    sim = cosine_similarity(item.embedding or [], rep.embedding or [])
                    if sim >= self.same_story_threshold:
                        c.append(item)
                        placed = True
                        break
            if not placed:
                clusters.append([item])

        return [Cluster(topic=label_cluster(c), items=c) for c in clusters]
