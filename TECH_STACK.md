# DevBoard Technology Stack

This document outlines the core technologies used in the DevBoard platform and maps them to where they are utilized within the codebase architecture.

## 🏗 Project Structure (Monorepo)

DevBoard is organized as a monorepo using npm workspaces, divided into three main packages:
- `/frontend`: The user-facing web application.
- `/backend`: Asynchronous background workers.
- `/shared`: Common database schemas, utility functions, and LLM pipelines shared across both frontend and backend.

---

## 1. Frontend (`/frontend`)
The frontend is a modern React application built for high performance and smooth UX.

* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Animations**: Framer Motion (used extensively for smooth tab transitions and UI micro-interactions)
* **Authentication**: NextAuth.js (v5 Beta) utilizing GitHub OAuth providers.
* **Data Visualization**: 
  * Recharts (for commit metrics and health scores)
  * React Flow (`@xyflow/react`) combined with `dagre` (for rendering the interactive architecture node graphs)
* **Markdown Rendering**: `react-markdown` and `react-syntax-highlighter` (used in the Architecture Review and Pending Decisions UI)

## 2. Shared Libraries & Database (`/shared`)
The shared folder acts as the central brain of the platform, containing the database schemas, LLM integrations, and queue definitions.

* **Database ORM**: Prisma (`@prisma/client`)
* **Primary Database**: PostgreSQL (Neon or local) with `pgvector` extension used for semantic similarity matching on architectural decisions.
* **Queue & Caching**: 
  * **Redis** (via `ioredis`): Acts as the backing store for the job queue.
  * **BullMQ**: Manages robust job queues for background processing (e.g., cloning repos, pinging APIs).
* **AI & LLMs**:
  * **OpenAI SDK**: Interfaces with OpenRouter to power the `generateArchitecture` and `commitDraftPipeline` features using GPT-4o-mini and text embeddings.
* **GitHub Operations**: Scripts to perform shallow git clones, read commit logs, and analyze dependencies.

## 3. Backend Workers (`/backend`)
The backend operates entirely independently from the Next.js API routes, designed to run heavy tasks asynchronously without blocking the user interface.

* **Runtime**: Node.js running via `tsx` (TypeScript Execute)
* **Job Processor**: BullMQ Workers
  * **Archaeology Worker**: Picks up jobs to clone GitHub repositories, extract languages, read `package.json`, and scan for Docker/Infra files.
  * *(Other workers as added)*: For continuous repository health checks and background polling.
* **GitHub API**: `octokit` (used to securely interact with the GitHub API on behalf of the user using OAuth access tokens).

---

## 🔄 How They Connect (Data Flow)

1. **User Action**: The user connects a repository on the **Next.js Frontend**.
2. **Database Save**: The frontend API route saves the repository state to **PostgreSQL** via **Prisma**.
3. **Queueing**: The frontend adds an "archaeology" job to the **BullMQ** queue (backed by **Redis**).
4. **Processing**: The **Node.js Backend Worker** picks up the job, clones the repo, and runs the LLM analysis via the **Shared OpenAI Pipeline**.
5. **Completion**: The worker updates the repository status in the database, and the frontend reflects the newly generated `ARCHITECTURE.md` file to the user.
