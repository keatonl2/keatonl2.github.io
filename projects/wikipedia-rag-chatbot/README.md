# Wikipedia RAG Chatbot: Grounding a Small Language Model in Retrieved Text

A retrieval-augmented generation (RAG) chatbot that answers questions about the Nebraska Cornhuskers football Wikipedia article. It scrapes and cleans the page, splits it into labeled chunks, retrieves the most relevant ones with sentence embeddings and a FAISS index, and has a small open-source language model answer only from those excerpts, citing the sections it used. A structured evaluation compares it with the same model answering from memory.

| | |
|---|---|
| **Competency area** | Retrieval systems and language-model evaluation |
| **Code** | [wikipedia-rag-chatbot.ipynb](wikipedia-rag-chatbot.ipynb) (full pipeline, evaluation, and Gradio chat interface, with saved outputs) |

## Problem

Small language models are cheap to run locally, but they hold little specific knowledge and tend to make up an answer rather than admit they don't know. The questions:

1. Does retrieval actually find the passage that answers a question?
2. How much does grounding the model in retrieved text improve its answers over the same model answering from memory?
3. Does it refuse questions the source can't answer, and where does it still break?

## Data

The English Wikipedia article **Nebraska Cornhuskers football** (CC BY-SA 4.0), scraped with Beautiful Soup when the notebook runs.

- **29 sections** and **41,668 characters** of clean text after removing references, citation numbers, "[edit]" links, tables, and back matter
- Split into **79 chunks** (median 587 characters), each labeled with its section path, such as `Championships > National championships`

## Methods

- **Scraping and cleaning.** Parsed the article's own section headings and stripped everything a reader wouldn't see as prose. The first scraper version returned zero sections because of a reused HTML class name, which I fixed before going further.
- **Chunking.** Recursive splitting at 800 characters with 150 characters of overlap, sized to fit the embedding model's 256-token limit. Each chunk carries its section label, which helped retrieval tell look-alike paragraphs apart.
- **Retrieval.** `all-MiniLM-L6-v2` sentence embeddings (384 dimensions) in a FAISS inner-product index, returning the top 4 chunks. Retrieval was tested on its own before any language model was added.
- **Generation.** `Qwen2.5-1.5B-Instruct` with greedy decoding. The system prompt keeps it to the excerpts, gives it an exact sentence to use when the answer isn't there, and asks it to name its sections.
- **Evaluation.** 10 answerable questions with known answers plus 2 out-of-scope questions, scored separately for retrieval hit, RAG correctness, and baseline correctness (the same model with no retrieval), along with refusals and latency.
- **Interface.** A Gradio chat window that shows the source sections under each reply, plus a multi-turn test of follow-up questions.

## Key results

| Measure | Result |
|---|---|
| Retrieval hit rate (answer in the top 4 chunks) | **100%** |
| RAG accuracy (strict keyword check) | **90%** (9 of 10) |
| Baseline accuracy (same model, no retrieval) | **0%** (0 of 10) |
| Out-of-scope questions refused | 2 of 2 |
| Average answer time | 1.9 seconds |

- **Retrieval keeps the model from inventing facts.** Without it, the model didn't say "I don't know." It confidently claimed Nebraska's only Heisman winner was Mike Leach in 1987 (Nebraska has three, none named Mike Leach) and credited the 1970–71 titles to the wrong coach. With retrieval it named Johnny Rodgers, Mike Rozier, and Eric Crouch.
- **The one "wrong" RAG answer was a scoring miss.** The model wrote "Nebraska 35, Oklahoma 31," which is correct, but the check looked for "35-31". Counting it, RAG went 10 for 10.
- **Passing the check isn't the same as being right.** One answer correctly gave the 35-game bowl streak, then attached Nebraska's all-time bowl record to it. The model can glue together two numbers from the same chunk.
- **Follow-up questions break it.** In a three-turn conversation, "he" was resolved to the wrong coach by the second turn, because retrieval only saw the previous question. Rewriting follow-ups into standalone questions is the first fix I'd make.

## Tools

Python, requests, Beautiful Soup, LangChain text splitters, sentence-transformers, FAISS, Hugging Face Transformers, PyTorch, pandas, Gradio.

## How to run

The notebook has every cell's saved output, so GitHub shows the full pipeline and evaluation without running anything.

To reproduce it:

1. `pip install -r requirements.txt` (a GPU is helpful but not required; it was run on a free Colab T4)
2. Open `wikipedia-rag-chatbot.ipynb` and run all cells. It downloads the article and both models on the first run.
3. The last section opens the Gradio chat window. If it doesn't appear, the text loop below it does the same thing.

Wikipedia articles change, so a later run may retrieve slightly different text than the saved outputs show.

## Limitations

- One article and 12 evaluation questions: enough to show the pattern, not to estimate accuracy precisely.
- The keyword scorer can miss correct answers written differently and pass answers that add a wrong detail, so I also read every answer.
- The 1.5B model still mixes up facts that sit in the same paragraph, and multi-turn conversations need query rewriting before they can be trusted.
- Answers show their source sections so a reader can check them. This is a lookup aid, not a source of record.
