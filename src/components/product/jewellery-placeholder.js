const motifs = {
  necklace: "rounded-[45%] border-b-0",
  earrings: "rounded-full",
  bangle: "rounded-full",
};

export function JewelleryPlaceholder({ type = "necklace", label }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(145deg,rgba(128,0,0,0.08),rgba(245,245,221,1))] p-5">
      <div className="absolute inset-x-8 top-8 h-px bg-brand-maroon/20" />
      <div className="grid h-full place-items-center border border-brand-maroon/20 bg-background/35">
        <div className="relative grid h-44 w-44 place-items-center">
          <span
            className={`absolute h-32 w-32 border-2 border-brand-maroon/55 ${motifs[type] || motifs.necklace}`}
          />
          <span className="absolute h-20 w-20 rounded-full border border-brand-maroon/30" />
          <span className="h-8 w-8 rounded-full bg-brand-maroon/80 shadow-[0_0_0_10px_rgba(128,0,0,0.08)]" />
          <span className="absolute bottom-7 h-5 w-5 rounded-full bg-brand-maroon/70" />
        </div>
      </div>
      {label ? (
        <span className="absolute left-4 top-4 bg-brand-maroon px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-ivory">
          {label}
        </span>
      ) : null}
    </div>
  );
}
