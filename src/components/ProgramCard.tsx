import Link from "next/link";
import Image from "next/image";
import { Program, formatCommission, iconLetter } from "@/lib/programs";

function Logo({ program, size }: { program: Program; size: "sm" | "md" | "lg" }) {
  const px = size === "lg" ? 56 : size === "md" ? 40 : 36;
  const cls =
    size === "lg" ? "h-14 w-14 text-xl" : size === "md" ? "h-10 w-10 text-sm" : "h-9 w-9 text-sm";
  if (program.logo) {
    return (
      <span className={`${cls} flex flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink-200 bg-white`}>
        <Image
          src={program.logo}
          alt={`${program.name} logo`}
          width={px}
          height={px}
          className="h-full w-full object-contain p-1"
          unoptimized
        />
      </span>
    );
  }
  return (
    <span className={`${cls} flex flex-shrink-0 items-center justify-center rounded-md bg-ink-100 font-bold text-ink-700`}>
      {iconLetter(program.name)}
    </span>
  );
}

export function ProgramCard({ program, featured = false }: { program: Program; featured?: boolean }) {
  return (
    <Link
      href={`/p/${program.slug}`}
      className={`card group flex flex-col gap-2 p-4 transition-colors hover:border-accent-500 ${
        featured ? "border-accent-500 shadow-sm ring-1 ring-accent-500/10" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Logo program={program} size="md" />
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

export function ProgramRow({
  program,
  featured = false,
  viewCount,
  viewCountLabel,
}: {
  program: Program;
  featured?: boolean;
  viewCount?: number;
  viewCountLabel?: string;
}) {
  return (
    <Link
      href={`/p/${program.slug}`}
      className={`card flex items-center gap-3 p-3 transition-colors hover:border-accent-500 ${
        featured ? "border-accent-500" : ""
      }`}
    >
      <Logo program={program} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink-900">{program.name}</span>
          {featured && <span className="pill-accent">Featured</span>}
          <span className="pill">{program.category}</span>
          {program.commission.type && <span className="pill">{program.commission.type}</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {program.short_description || program.description}
        </p>
      </div>
      <div className="hidden flex-shrink-0 flex-col items-end gap-0.5 sm:flex">
        <span className="text-xs font-medium text-ink-700">
          {formatCommission(program.commission)}
        </span>
        {typeof viewCount === "number" && (
          <span className="text-[10px] text-ink-500">
            👁 {viewCount.toLocaleString()} {viewCountLabel}
          </span>
        )}
      </div>
    </Link>
  );
}

export { Logo };
