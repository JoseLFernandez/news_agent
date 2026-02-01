from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.api.models import GlobalPerspectiveRequest, GlobalPerspectiveResponse

router = APIRouter(prefix="/api", tags=["global-perspective"])


@router.post("/global-perspective", response_model=GlobalPerspectiveResponse)
def global_perspective(req: GlobalPerspectiveRequest) -> GlobalPerspectiveResponse:
    # TODO: wire real dependencies via DI (startup event, container, etc.).
    # This endpoint is scaffolded and returns 501 until Pinecone + embedder are injected.
    try:
        raise NotImplementedError(
            "Backend scaffolded. Next: wire Pinecone client/index + embedder and call GlobalPerspectiveService."
        )
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
