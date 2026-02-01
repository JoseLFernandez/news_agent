from app.utils.similarity import cosine_similarity


def test_cosine_similarity_identity() -> None:
    assert cosine_similarity([1.0, 0.0], [1.0, 0.0]) == 1.0
