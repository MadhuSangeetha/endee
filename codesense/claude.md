# claude.md — CodeSense Implementation Rules

	⁠*ROLE:* Staff Full-Stack Engineer & ML Architect.
	⁠*OBJECTIVE:* Build CodeSense per PRD.md instructions.
	⁠*STRICT RULE:* Use Endee.io SDK v2.0 syntax. Enforce Asymmetrical BM25 logic.

## 1. Technical Constants
•⁠  ⁠*Database:* ⁠ endeeio/endee-server:latest ⁠ on Port ⁠ 8080 ⁠.
•⁠  ⁠*Backend Stack:* ⁠ fastapi ⁠, ⁠ endee ⁠, ⁠ endee-model ⁠, ⁠ tree-sitter ⁠, ⁠ tree-sitter-languages ⁠, ⁠ numpy ⁠.
•⁠  ⁠*Index Config:* Dimension 384, Space ⁠ cosine ⁠, Sparse Model ⁠ endee_bm25 ⁠.

## 2. AST Chunking Logic (SDE Moat)
In ⁠ backend/services/parser_service.py ⁠, you must implement:
•⁠  ⁠Parsing of ⁠ .py ⁠ and ⁠ .js ⁠ files using ⁠ tree-sitter ⁠.
•⁠  ⁠Nodes to capture: ⁠ function_definition ⁠, ⁠ class_definition ⁠, ⁠ method_definition ⁠.
•⁠  ⁠Output: A list of dicts: ⁠ {"text": code, "name": func_name, "file": path, "line": start_line} ⁠.

## 3. Endee SDK Protocol

### 3.1 Asymmetric BM25
Strictly separate the encoding paths in ⁠ backend/core/embedders.py ⁠:
•⁠  ⁠*Storage Path:* ⁠ sparse_model.embed(code_chunk) ⁠ (Full TF-IDF).
•⁠  ⁠*Search Path:* ⁠ sparse_model.query_embed(user_query) ⁠ (IDF optimized).

### 3.2 The Upsert Contract
All metadata MUST be inside the ⁠ meta ⁠ field. Use CamelCase for sparse fields.
```python
payload = [{
    "id": str(uuid.uuid4()),
    "vector": dense_vector,
    "sparseIndices": sparse_doc.indices.tolist(),
    "sparseValues": sparse_doc.values.tolist(),
    "meta": {
        "code_snippet": text,
        "function_name": name,
        "file_path": path,
        "language": lang
    }
}]
index.upsert(payload)
3.3 Side-by-Side Search Logic
The search_service.py must return:

dense_results: Executed with only vector.

hybrid_results: Executed with vector AND sparseIndices/sparseValues.

4.⁠ ⁠UI/UX Refinement
Theme: Background #050505, Accent #00e5ff (Endee Cyan).

Comparison: Build a toggle or side-by-side view to prove why Hybrid wins.

Interactions: Use Shadcn UI Card, Table, and Badge.

5.⁠ ⁠Token Efficiency & Workflow
Only output the file currently being written.

Start with Backend (Phase 1) and verify via /index endpoint before starting Frontend.