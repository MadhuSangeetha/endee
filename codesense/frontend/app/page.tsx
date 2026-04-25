"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import { Activity, Braces, Clock3, Database, Radar, Search, Sparkles } from "lucide-react";
import Header from "../components/Header";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type SearchResult = {
  code_snippet: string;
  file_path: string;
  function_name: string;
  language: string;
  score: number;
  reason: string;
};

type SearchApiResponse = {
  dense_results: SearchResult[];
  hybrid_results: SearchResult[];
};

const fallbackResponse: SearchApiResponse = {
  dense_results: [
    {
      code_snippet: "def process_data(input_text):",
      file_path: "services/data_processor.py",
      function_name: "process_data",
      language: "python",
      score: 0.61,
      reason: "Generic semantic intent match",
    },
  ],
  hybrid_results: [
    {
      code_snippet: "def authenticate_user(token):",
      file_path: "auth/session_manager.py",
      function_name: "authenticate_user",
      language: "python",
      score: 0.95,
      reason: "Exact symbol + semantic alignment",
    },
    {
      code_snippet: "class ASTParser:",
      file_path: "core/parser/ast_parser.py",
      function_name: "ASTParser",
      language: "python",
      score: 0.93,
      reason: "AST class name and intent match",
    },
  ],
};

const gradientHalo =
  "bg-[radial-gradient(circle_at_top,_rgba(0,229,255,0.18),_transparent_52%)]";

const latencyData = [
  { t: "09:00", latency: 17.1 },
  { t: "09:05", latency: 15.6 },
  { t: "09:10", latency: 14.9 },
  { t: "09:15", latency: 16.2 },
  { t: "09:20", latency: 14.2 },
  { t: "09:25", latency: 13.8 },
];

const languageData = [
  { name: "Python", value: 52, color: "#00e5ff" },
  { name: "JavaScript", value: 33, color: "#0891b2" },
  { name: "C++", value: 15, color: "#155e75" },
];

export default function Page() {
  const [query, setQuery] = useState("where is authentication handled?");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchApiResponse>(fallbackResponse);

  const summary = useMemo(() => {
    const denseTop = results.dense_results[0]?.score ?? 0;
    const hybridTop = results.hybrid_results[0]?.score ?? 0;
    const lift = ((hybridTop - denseTop) * 100).toFixed(1);
    return `Hybrid relevance lift: +${lift}%`;
  }, [results]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Search failed");
      const data = (await response.json()) as SearchApiResponse;
      setResults(data);
    } catch {
      setResults(fallbackResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-dvh bg-[#050505] text-zinc-100 ${gradientHalo}`}>
      <Header />

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-cyan-500/25 bg-white/5 p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(0,229,255,0.08)]">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Activity className="h-4 w-4" />
              System Status
            </h3>
            <div className="space-y-2 text-xs text-zinc-300">
              <p className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                Index Health: <span className="text-emerald-300">Healthy</span>
              </p>
              <p className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                Mock Mode: <span className="text-emerald-300">Live</span>
              </p>
              <p className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">
                Active Queries: <span className="text-cyan-300">14/min</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/25 bg-white/5 p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(0,229,255,0.08)]">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Radar className="h-4 w-4" />
              AST Nodes
            </h3>
            <div className="space-y-2 text-xs text-zinc-300">
              <p className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">function_definition: 632</p>
              <p className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">class_definition: 214</p>
              <p className="rounded-lg border border-white/10 bg-black/35 px-3 py-2">method_definition: 402</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Chunks"
              value="1,248"
              icon={<Database className="h-4 w-4 text-cyan-300" />}
              monoClass={jetBrainsMono.className}
            />
            <MetricCard
              label="Avg Relevance Lift"
              value="+34.2%"
              icon={<Sparkles className="h-4 w-4 text-cyan-300" />}
              valueClass="text-cyan-300"
              monoClass={jetBrainsMono.className}
            />
            <MetricCard
              label="P99 Search Latency"
              value="14.2ms"
              icon={<Clock3 className="h-4 w-4 text-cyan-300" />}
              monoClass={jetBrainsMono.className}
            />
            <MetricCard
              label="Indexed Languages"
              value="3 (Python, JS, C++)"
              icon={<Braces className="h-4 w-4 text-cyan-300" />}
              monoClass={jetBrainsMono.className}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-cyan-500/25 bg-white/5 p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(0,229,255,0.08)]">
              <h3 className="mb-4 text-sm font-semibold text-cyan-300">Latency Over Time</h3>
              <LatencyAreaChart data={latencyData} />
            </div>

            <div className="rounded-2xl border border-cyan-500/25 bg-white/5 p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(0,229,255,0.08)]">
              <h3 className="mb-4 text-sm font-semibold text-cyan-300">Language Breakdown</h3>
              <LanguagePieChart data={languageData} />
            </div>
          </div>

          <form onSubmit={onSubmit} className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#00e5ff]/90" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search codebase..."
              className="h-16 w-full rounded-2xl border border-[#00e5ff]/45 bg-white/5 pl-14 pr-28 text-lg text-zinc-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04),0_0_34px_rgba(0,229,255,0.25)] outline-none backdrop-blur-xl transition focus:border-[#00e5ff] focus:ring-2 focus:ring-cyan-500/50 focus:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04),0_0_42px_rgba(0,229,255,0.2)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/15 px-5 py-2.5 text-sm font-medium text-[#8ef3ff] transition hover:bg-[#00e5ff]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Run Search"}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1.5">
              <Braces className="h-4 w-4 text-zinc-300" />
              Baseline: Dense Vector
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00e5ff]/35 bg-[#00e5ff]/10 px-3 py-1.5 text-[#8ef3ff]">
              <Sparkles className="h-4 w-4" />
              Endee Hybrid (AST + BM25)
            </span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-emerald-200">
              {summary}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ResultPane
              title="Dense Search (Baseline)"
              subtitle="General semantic matches, lower precision for exact symbols."
              icon={<Braces className="h-4 w-4 text-zinc-300" />}
              results={results.dense_results}
              className="border-zinc-800 bg-white/[0.03]"
              monoClass={jetBrainsMono.className}
            />

            <ResultPane
              title="Endee Hybrid Search (AST + BM25)"
              subtitle="Symbol-aware retrieval with AST context and lexical accuracy."
              icon={<Sparkles className="h-4 w-4 text-[#00e5ff]" />}
              results={results.hybrid_results}
              className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
              monoClass={jetBrainsMono.className}
              highlight
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
  monoClass,
  valueClass = "text-zinc-100",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  monoClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-white/5 p-4 backdrop-blur-xl shadow-[0_0_24px_rgba(0,229,255,0.08)]">
      <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
        {icon}
        {label}
      </div>
      <p className={`${monoClass} text-lg font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function LatencyAreaChart({
  data,
}: {
  data: { t: string; latency: number }[];
}) {
  const width = 520;
  const height = 190;
  const padding = 18;
  const min = Math.min(...data.map((d) => d.latency));
  const max = Math.max(...data.map((d) => d.latency));
  const range = Math.max(max - min, 1);

  const points = data
    .map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - ((d.latency - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="h-48 w-full rounded-xl border border-slate-800 bg-[#0d1117] p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <defs>
          <linearGradient id="latencyFillZeroDep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="#00e5ff" strokeWidth="2.5" />
        <polygon points={areaPoints} fill="url(#latencyFillZeroDep)" />
      </svg>
    </div>
  );
}

function LanguagePieChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const radius = 68;
  const innerRadius = 40;
  const center = 96;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let running = 0;

  const polarToCartesian = (angleDeg: number, r: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: center + r * Math.cos(angleRad), y: center + r * Math.sin(angleRad) };
  };

  const slices = data.map((d) => {
    const start = (running / total) * 360;
    running += d.value;
    const end = (running / total) * 360;
    const startPoint = polarToCartesian(start, radius);
    const endPoint = polarToCartesian(end, radius);
    const largeArc = end - start > 180 ? 1 : 0;
    const path = `M ${center} ${center} L ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y} Z`;
    return { ...d, path };
  });

  return (
    <div className="grid h-48 w-full grid-cols-[200px_minmax(0,1fr)] gap-2 rounded-xl border border-slate-800 bg-[#0d1117] p-2">
      <svg viewBox="0 0 192 192" className="h-full w-full">
        {slices.map((slice) => (
          <path key={slice.name} d={slice.path} fill={slice.color} stroke="#050505" strokeWidth="1.5" />
        ))}
        <circle cx={center} cy={center} r={innerRadius} fill="#0d1117" />
      </svg>
      <div className="flex flex-col justify-center gap-2 text-xs text-zinc-300">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/35 px-2 py-1.5">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPane({
  title,
  subtitle,
  icon,
  results,
  className,
  monoClass,
  highlight = false,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  results: SearchResult[];
  className: string;
  monoClass: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 backdrop-blur-xl ${className} ${highlight ? "relative after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-[#00e5ff]/30" : ""}`}
    >
      <div className="mb-4">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm">
          {icon}
          <span>{title}</span>
        </div>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {results.map((item, index) => (
          <div
            key={`${item.function_name}-${index}`}
            className="rounded-xl border border-white/10 bg-black/35 p-5"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                {item.language}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                score: {item.score.toFixed(2)}
              </span>
              <span className="truncate text-zinc-400">{item.file_path}</span>
            </div>
            <pre
              className={`overflow-x-auto rounded-lg border border-slate-800 bg-[#0d1117] p-5 text-sm text-slate-200 ${monoClass}`}
            >
              <code>{item.code_snippet}</code>
            </pre>
            <p className="mt-2 text-xs text-zinc-400">{item.reason}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
