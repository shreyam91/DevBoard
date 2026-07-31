"use client";

import { motion } from "framer-motion";
import { Background } from "@/components/landing/Background";
import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Code2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

const ENDPOINTS = [
  { id: "quick-start", title: "Quick Start" },
  { id: "authentication", title: "Authentication" },
  { id: "rate-limits", title: "Rate Limits" },
  { id: "repositories", title: "Repositories" },
  { id: "repository", title: "Repository Details" },
  { id: "create-repository", title: "Create Repository" },
  { id: "decisions", title: "Architecture Decisions" },
  { id: "conflicts", title: "Conflicts" },
  { id: "webhooks", title: "Webhooks" },
  { id: "errors", title: "Errors" },
  { id: "pagination", title: "Pagination" },
  { id: "sdks", title: "SDK Examples" },
  { id: "changelog", title: "API Changelog" },
];

export default function DocsPage() {
  const [activeEndpoint, setActiveEndpoint] =
    useState<string>("authentication");

  const scrollTo = (id: string) => {
    setActiveEndpoint(id);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent-blue/20 text-slate-900 relative overflow-hidden">
      <Background />
      <MarketingNavbar isSignedIn={false} />

      <main className="relative z-10 flex-1 px-6 py-20 md:px-12 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-[250px_1fr] gap-16 items-start">
        {/* Left: Sticky Navigation */}
        <aside className="hidden md:flex flex-col sticky top-32">
          <div className="text-[12px] font-bold tracking-widest text-slate-400 uppercase mb-6">
            API Reference
          </div>
          <nav className="flex flex-col gap-3 border-l-2 border-slate-100 pl-4">
            {ENDPOINTS.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => scrollTo(endpoint.id)}
                className={cn(
                  "text-left text-[14px] font-medium transition-colors hover:text-slate-900",
                  activeEndpoint === endpoint.id
                    ? "text-accent-blue"
                    : "text-slate-500",
                )}
              >
                {endpoint.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right: API Content */}
        <div className="flex flex-col">
          <div className="mb-16 border-b border-slate-200 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 mb-8 shadow-sm"
            >
              <Code2 className="w-4 h-4 text-accent-blue" />
              <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-widest">
                Developers
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[40px] md:text-[56px] font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]"
            >
              API Documentation
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[16px] md:text-[18px] text-slate-500 leading-relaxed"
            >
              Integrate DevBoard&apos;s architectural intelligence directly into your
              CI/CD pipelines, custom dashboards, or internal developer portals.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-24"
          >
            <section id="quick-start" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Quick Start</h2>

              <p className="text-slate-600 mb-8">
                The DevBoard API uses Bearer authentication. Generate an API key
                from your dashboard and include it with every request.
              </p>

              <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono">
                {`curl https://api.devboard.io/v1/user \\
-H "Authorization: Bearer YOUR_API_KEY"`}
              </div>
            </section>

            <section id="authentication" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Authentication</h2>

              <p className="text-slate-600 mb-8">
                Authenticate every request using a Personal Access Token.
              </p>

              <div className="space-y-4 mb-8">
                <div className="rounded-lg border border-slate-200 p-5">
                  <h3 className="font-semibold mb-2">Base URL</h3>

                  <code>https://api.devboard.io/v1</code>
                </div>

                <div className="rounded-lg border border-slate-200 p-5">
                  <h3 className="font-semibold mb-2">Authorization Header</h3>

                  <code>Authorization: Bearer YOUR_API_KEY</code>
                </div>
              </div>
            </section>

            <section id="rate-limits" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Rate Limits</h2>

              <p className="text-slate-600">
                All API keys are limited to 100 requests per minute.
              </p>

              <ul className="mt-6 list-disc pl-6 text-slate-600 space-y-2">
                <li>100 requests / minute</li>
                <li>429 returned when exceeded</li>
                <li>Retry using the Retry-After header</li>
              </ul>
            </section>

            <section id="repositories" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">
                List Repositories
              </h2>

              <p className="text-slate-600 mb-8">
                Returns every repository in your workspace.
              </p>

              <div className="rounded-lg border p-4 bg-slate-50 mb-8">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono mr-3">
                  GET
                </span>

                <code>/v1/repos</code>
              </div>

              <h3 className="font-semibold mb-4">Query Parameters</h3>

              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-left">Parameter</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Description</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="p-3">page</td>
                    <td className="p-3">number</td>
                    <td className="p-3">Page number</td>
                  </tr>

                  <tr>
                    <td className="p-3">limit</td>
                    <td className="p-3">number</td>
                    <td className="p-3">Results per page</td>
                  </tr>

                  <tr>
                    <td className="p-3">search</td>
                    <td className="p-3">string</td>
                    <td className="p-3">Search repositories</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section id="repository" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Get Repository</h2>

              <div className="rounded-lg border p-4 bg-slate-50 mb-8">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono mr-3">
                  GET
                </span>

                <code>/v1/repos/:id</code>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300">
                {`{
  "id":"repo_123",
  "name":"backend-api",
  "visibility":"private",
  "decisions_count":42,
  "created_at":"2026-01-20"
}`}
              </div>
            </section>

            <section id="create-repository" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">
                Create Repository
              </h2>

              <div className="rounded-lg border p-4 bg-slate-50 mb-8">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-mono mr-3">
                  POST
                </span>

                <code>/v1/repos</code>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300">
                {`{
  "name":"payments-api",
  "visibility":"private"
}`}
              </div>
            </section>

            <section id="decisions" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">
                Architecture Decisions
              </h2>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  GET /v1/repos/:id/decisions
                </div>

                <div className="rounded-lg border p-4">
                  POST /v1/repos/:id/decisions
                </div>

                <div className="rounded-lg border p-4">
                  PATCH /v1/decisions/:id
                </div>

                <div className="rounded-lg border p-4">
                  DELETE /v1/decisions/:id
                </div>
              </div>
            </section>

            <section id="conflicts" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Conflicts</h2>

              <p className="text-slate-600 mb-8">
                Detect architectural conflicts across repositories.
              </p>

              <div className="rounded-lg border p-4 bg-slate-50">
                GET /v1/repos/:id/conflicts
              </div>
            </section>

            <section id="webhooks" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Webhooks</h2>

              <p className="text-slate-600 mb-8">
                Subscribe to DevBoard events.
              </p>

              <ul className="space-y-3">
                <li>repo.created</li>

                <li>repo.deleted</li>

                <li>decision.created</li>

                <li>decision.updated</li>

                <li>conflict.detected</li>

                <li>sync.completed</li>
              </ul>
            </section>

            <section id="errors" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Error Codes</h2>

              <table className="w-full border">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3">Status</th>

                    <th className="p-3">Meaning</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="p-3">200</td>
                    <td className="p-3">Success</td>
                  </tr>

                  <tr>
                    <td className="p-3">201</td>
                    <td className="p-3">Created</td>
                  </tr>

                  <tr>
                    <td className="p-3">400</td>
                    <td className="p-3">Bad Request</td>
                  </tr>

                  <tr>
                    <td className="p-3">401</td>
                    <td className="p-3">Unauthorized</td>
                  </tr>

                  <tr>
                    <td className="p-3">403</td>
                    <td className="p-3">Forbidden</td>
                  </tr>

                  <tr>
                    <td className="p-3">404</td>
                    <td className="p-3">Not Found</td>
                  </tr>

                  <tr>
                    <td className="p-3">429</td>
                    <td className="p-3">Rate Limited</td>
                  </tr>

                  <tr>
                    <td className="p-3">500</td>
                    <td className="p-3">Internal Server Error</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section id="pagination" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">Pagination</h2>

              <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300">
                {`{
  "page":1,
  "limit":20,
  "total":182,
  "has_more":true,
  "data":[]
}`}
              </div>
            </section>

            <section id="sdks" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">
                Node.js Example
              </h2>

              <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300">
                {`import { DevBoard } from "@devboard/sdk";

const client = new DevBoard({
  apiKey: process.env.DEVBOARD_API_KEY,
});

const repos = await client.repositories.list();`}
              </div>
            </section>

            <section id="changelog" className="scroll-mt-32">
              <h2 className="text-[28px] font-semibold mb-4">API Changelog</h2>

              <div className="space-y-6">
                <div className="border-l-2 border-blue-500 pl-4">
                  <h3 className="font-semibold">v1.4.0</h3>

                  <ul className="mt-2 text-slate-600 list-disc pl-5">
                    <li>Added webhook retries</li>

                    <li>Added repository search</li>

                    <li>Added conflict detection endpoint</li>
                  </ul>
                </div>

                <div className="border-l-2 border-slate-300 pl-4">
                  <h3 className="font-semibold">v1.3.0</h3>

                  <ul className="mt-2 text-slate-600 list-disc pl-5">
                    <li>Initial public API release</li>
                  </ul>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </main>

      <div className="relative z-10">
        <MarketingFooter />
      </div>
    </div>
  );
}
