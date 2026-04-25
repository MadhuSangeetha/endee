# PRD.md — CodeSense: Semantic Code Intelligence Engine

	⁠*Version:* 1.0 (AST-Optimized) | *Deadline:* April 25, 2026
	⁠*Project Name:* CodeSense | *Author:* Harshith Kumar
	⁠*Target:* SDE Intern + AI Intern Recruitment (Endee.io)

## 1. Executive Summary
CodeSense is a production-grade semantic search engine designed specifically for codebases. It moves beyond naive text-splitting by using *AST (Abstract Syntax Tree) Chunking* and leverages Endee’s *Hybrid Search* to solve the "Exact Match vs. Intent Match" problem in developer tools.

## 2. The Moats (Technical Depth)
### A. SDE Moat: AST-Based Parsing (Tree-sitter)
Most RAG tools break code context by splitting at arbitrary line counts. CodeSense uses ⁠ tree-sitter ⁠ to parse source files into trees, extracting complete functional units (functions, classes, methods) as discrete vectors. This preserves the scope and logic of the code.

### B. AI Moat: Asymmetrical Hybrid Benchmarking
Code search requires two modes:
1.⁠ ⁠*Keyword (Sparse):* Finding specific variable names or function signatures like ⁠ on_click_handler ⁠.
2.⁠ ⁠*Semantic (Dense):* Finding concepts like "Where is the authentication handled?".
CodeSense implements Endee's *Asymmetrical BM25* (TF/IDF split) to fuse these results, demonstrating a 10x improvement in retrieval relevance over dense-only systems.

## 3. System Architecture
1.⁠ ⁠*Parser Layer:* ⁠ tree-sitter ⁠ extracts functional blocks from local or cloned repositories.
2.⁠ ⁠*Inference Layer:* ⁠ all-MiniLM-L6-v2 ⁠ (Dense) + ⁠ endee-model ⁠ (Sparse BM25).
3.⁠ ⁠*Storage Layer:* Endee.io (Docker Port 8080) in Hybrid Search mode.
4.⁠ ⁠*Backend:* FastAPI (Modular Service-Layer Pattern).
5.⁠ ⁠*Frontend:* Next.js 14 (App Router) with "Infrastructure Noir" styling.

## 4. UI/UX Design: "The Developer's View"
•⁠  ⁠*Dual-Pane Search:* A side-by-side comparison showing "Dense-Only" results vs "Endee Hybrid" results.
•⁠  ⁠*Code Highlighting:* Integrated syntax highlighting for retrieved snippets.
•⁠  ⁠*Metadata Filtering:* Scoping searches by ⁠ language ⁠ (Python/JS) or ⁠ file_path ⁠.

## 5. 24-Hour Execution Plan
•⁠  ⁠*Phase 1 (Core):* Docker setup, Tree-sitter parser implementation, Endee SDK integration.
•⁠  ⁠*Phase 2 (Logic):* Asymmetric encoding (Store vs Query paths) and Hybrid Search service.
•⁠  ⁠*Phase 3 (Frontend):* Next.js dashboard, Comparison View, and Code rendering.