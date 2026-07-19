"use client";

import { useState } from "react";
import { setPublishWebhookAction } from "@/app/actions";
import { t } from "@/lib/i18n";

export function PublishSettings({ webhook }: { webhook: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-line bg-panel px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-[13px] font-semibold text-ink"
      >
        <span
          className="status-dot"
          style={{ color: webhook ? "#34c759" : "#c7c7cc" }}
        />
        {t.approvals.publishLabel}
        <span className="ml-auto text-[12px] font-normal text-ink-muted">
          {open ? "▲" : webhook ? "podłączone" : "wyłączone"}
        </span>
      </button>

      {open && (
        <form action={setPublishWebhookAction} className="mt-3 flex flex-col gap-2">
          <p className="text-[12px] leading-relaxed text-ink-muted">
            {t.approvals.publishHint}
          </p>
          <div className="flex gap-2">
            <input
              name="webhook"
              type="url"
              defaultValue={webhook}
              placeholder={t.approvals.publishPlaceholder}
              className="min-w-0 flex-1 rounded-xl border border-line bg-panel-2 px-4 py-2.5 font-mono text-[13px] text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
            >
              {t.approvals.publishSave}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
