from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


@dataclass
class MockSearchRow:
    code_snippet: str
    file_path: str
    function_name: str
    language: str
    score: float
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "code_snippet": self.code_snippet,
            "file_path": self.file_path,
            "function_name": self.function_name,
            "language": self.language,
            "score": self.score,
            "reason": self.reason,
        }


class MockEndeeClient:
    """
    Mock replacement for Endee Hybrid DB client.
    Keeps submission zero-dependency and fast for demo.
    """

    def search(self, query: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        dense_rows = [
            MockSearchRow(
                code_snippet="def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):",
                file_path="app/dependencies/auth.py",
                function_name="get_current_user",
                language="python",
                score=0.64,
                reason="Broad auth intent from dense semantic embedding",
            ),
            MockSearchRow(
                code_snippet="useEffect(() => { fetchData(); }, [repoId]);",
                file_path="src/hooks/useRepoData.tsx",
                function_name="useRepoDataEffect",
                language="typescript",
                score=0.59,
                reason="Concept-level frontend data-flow similarity",
            ),
            MockSearchRow(
                code_snippet="void SearchIndex::query(const QueryVector& q) {",
                file_path="src/search/search_index.cpp",
                function_name="SearchIndex::query",
                language="cpp",
                score=0.56,
                reason="Approximate vector retrieval concept match",
            ),
        ]

        hybrid_rows = [
            MockSearchRow(
                code_snippet='payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])',
                file_path="app/security/jwt.py",
                function_name="jwt.decode",
                language="python",
                score=0.96,
                reason="Exact `token` and `ALGORITHM` variable match for auth flow",
            ),
            MockSearchRow(
                code_snippet="username: str = payload.get('sub')",
                file_path="app/security/jwt.py",
                function_name="payload.get",
                language="python",
                score=0.94,
                reason="Sparse match on `payload`, `sub`, and auth identity extraction",
            ),
            MockSearchRow(
                code_snippet="useEffect(() => { let ignore = false; fetchBio(person).then(r => { if (!ignore) setBio(r); }); return () => { ignore = true; }; }, [person]);",
                file_path="packages/react.dev/src/content/reference/react/useEffect.md",
                function_name="useEffect(fetchBio)",
                language="javascript",
                score=0.93,
                reason="Exact `useEffect`, `fetchBio`, `setBio`, `person` token hit",
            ),
            MockSearchRow(
                code_snippet="if (query_vector.size() != dimension_) throw std::runtime_error(\"dimension mismatch\");",
                file_path="src/vector/hnsw_index.cpp",
                function_name="HnswIndex::search",
                language="cpp",
                score=0.92,
                reason="Identifier-level hit on `query_vector` and `dimension_`",
            ),
            MockSearchRow(
                code_snippet="__m256 q = _mm256_loadu_ps(query_ptr + i); __m256 d = _mm256_loadu_ps(doc_ptr + i); acc = _mm256_fmadd_ps(q, d, acc);",
                file_path="src/simd/dot_product_avx2.cpp",
                function_name="dot_product_avx2",
                language="cpp",
                score=0.95,
                reason="Exact SIMD tokens `_mm256_loadu_ps` and `_mm256_fmadd_ps` matched",
            ),
            MockSearchRow(
                code_snippet="app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])",
                file_path="fastapi/applications.py",
                function_name="FastAPI.add_middleware",
                language="python",
                score=0.9,
                reason="Exact `CORSMiddleware` and wildcard CORS settings match",
            ),
            MockSearchRow(
                code_snippet="const [state, dispatch] = useReducer(reducer, initialState);",
                file_path="packages/react/src/ReactHooks.js",
                function_name="useReducer",
                language="javascript",
                score=0.88,
                reason="Sparse token hit on state-management variable names",
            ),
        ]

        query_lower = query.lower().strip()
        if "auth" in query_lower or "token" in query_lower or "jwt" in query_lower:
            hybrid_rows.sort(
                key=lambda row: (
                    "jwt" not in row.code_snippet.lower()
                    and "token" not in row.code_snippet.lower(),
                    -row.score,
                )
            )
        elif "vector" in query_lower or "simd" in query_lower or "avx" in query_lower:
            hybrid_rows.sort(
                key=lambda row: (
                    "_mm256" not in row.code_snippet.lower()
                    and "vector" not in row.code_snippet.lower(),
                    -row.score,
                )
            )
        elif "react" in query_lower or "useeffect" in query_lower or "hook" in query_lower:
            hybrid_rows.sort(
                key=lambda row: (
                    "useeffect" not in row.code_snippet.lower()
                    and "fetchbio" not in row.code_snippet.lower(),
                    -row.score,
                )
            )

        return [row.to_dict() for row in dense_rows], [row.to_dict() for row in hybrid_rows]


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User search query")


class SearchResponse(BaseModel):
    dense_results: list[dict[str, Any]]
    hybrid_results: list[dict[str, Any]]


app = FastAPI(title="CodeSense Mock API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mock_client = MockEndeeClient()


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "mock"}


@app.post("/search", response_model=SearchResponse)
def search(payload: SearchRequest) -> SearchResponse:
    dense_results, hybrid_results = mock_client.search(payload.query)
    return SearchResponse(dense_results=dense_results, hybrid_results=hybrid_results)
