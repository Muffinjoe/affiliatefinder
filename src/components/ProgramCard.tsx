import Link from "next/link";
import { Program, isFeatured, formatCommission, iconLetter } from "@/lib/programs";

export function ProgramCard({ program }: { program: Program }) {
  const featured = isFeatured(program);
  return (
    <Link
      href={`/p/${program.slug}`}
      className={`card group flex flex-col gap-2 p-4 transition-colors hover:border-accent-500 ${
        featured ? "border-accent-500 shadow-sm ring-1 ring-accent-500/10" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-ink-100 text-sm font-bold text-ink-700">
          {iconLetter(program.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-ink-900 group-hover:text-accent-600">
              {program.name}
            </h3>
            {featured && <span className="pill-accent">Featured</span>}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">
            {program.short_description || program.description}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[11px] text-ink-500">
        <span className="pill">{program.category}</span>
        <span className="font-medium text-ink-700">{formatCommission(program.commission)}</span>
      </div>
    </Link>
  );
}

export function ProgramRow({ program }: { program: Program }) {
  const featured = isFeatured(program);
  return (
    <Link
      href={`/p/${program.slug}`}
      className={`card flex items-center gap-3 p-3 transition-colors hover:border-accent-500 ${
        featured ? "border-accent-500" : ""
      }`}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-ink-100 text-sm font-bold text-ink-700">
        {iconLetter(program.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink-900">{program.name}</span>
          {featured && <span className="pill-accent">Featured</span>}
          <span className="pill">{program.category}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {program.short_description || program.description}
        </p>
      </div>
      <span className="hidden flex-shrink-0 text-xs font-medium text-ink-700 sm:block">
        {formatCommission(program.commission)}
      </span>
    </Link>
  );
}
