import Link from 'next/link';
import { ArrowUpRight, GitFork, GitPullRequest, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, EmptyState, ScoreRing } from '@/components/ui/primitives';
import { getProjects, getRepos, demoMeta } from '@/data';

function HealthBar({ label, val }: { label: string; val: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-semibold stat-value">{val}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]">
        <div className={cn('h-full rounded-full', val >= 85 ? 'bg-[var(--ok)]' : val >= 70 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]')} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Every GitHub project under DevHub's engineering intelligence — health, review, and documentation at a glance."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>}
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create or connect a project and DevHub will begin analyzing its repositories." action={<Link href="/repos" className="btn btn-primary btn-sm"><GitFork className="h-3.5 w-3.5" /> Connect a repository</Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((p) => {
            const repos = getRepos().filter((r) => p.repoIds.includes(r.id));
            return (
              <div key={p.id} className="card card-hover p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[16px] font-bold tracking-tight text-[var(--text)]">{p.name}</h2>
                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{p.tagline}</p>
                  </div>
                  <ScoreRing score={p.health.health} size={52} label="Health" />
                </div>

                {/* Health bars */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <HealthBar label="Architecture" val={p.health.architecture} />
                  <HealthBar label="AI review" val={p.health.review} />
                  <HealthBar label="Documentation" val={p.health.documentation} />
                </div>

                {/* Active work */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5"><GitPullRequest className="h-3.5 w-3.5" /><b className="stat-value text-[var(--text)]">{p.active.reviewsWaiting}</b> reviews waiting</span>
                  <span className="flex items-center gap-1.5"><ArrowUpRight className="h-3.5 w-3.5" /><b className="stat-value text-[var(--text)]">{p.active.conflicts}</b> conflicts</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /><b className="stat-value text-[var(--text)]">{p.active.docUpdates}</b> doc updates</span>
                </div>

                {/* Repos */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {repos.map((r) => (
                    <Link key={r.id} href={`/repos/${r.id}`} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-[12px] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]">
                      <GitFork className="h-3 w-3" />{r.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}