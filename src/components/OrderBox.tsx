import { t } from "@/lib/i18n";

export function OrderBox() {
  return (
    <section className="rounded-2xl border border-line bg-panel p-4 sm:p-6">
      <h2 className="font-display text-sm uppercase tracking-widest text-ink-muted">
        {t.order.heading}
      </h2>
      <form className="mt-3 flex flex-col gap-3 sm:flex-row">
        <textarea
          rows={2}
          placeholder={t.order.placeholder}
          className="min-h-[3.25rem] flex-1 resize-y rounded-xl border border-line bg-panel-2 px-4 py-3 text-ink placeholder:text-ink-muted/70 focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          className="shrink-0 rounded-xl bg-gradient-to-b from-accent-2 to-accent px-6 py-3 font-display text-sm font-semibold text-[#241900] transition hover:brightness-110 sm:self-end"
        >
          {t.order.submit}
        </button>
      </form>
      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        {t.order.hint}
      </p>
    </section>
  );
}
