"use client";

import { useActionState } from "react";
import { submitOrder, type OrderFormState } from "@/app/actions";
import { t } from "@/lib/i18n";

export function OrderBox({ initialText }: { initialText?: string }) {
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(
    submitOrder,
    {},
  );

  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <textarea
          name="order"
          rows={2}
          defaultValue={initialText}
          autoFocus={!!initialText}
          placeholder={t.order.placeholder}
          className="min-h-[3.25rem] flex-1 resize-y rounded-xl border border-line bg-panel-2 px-4 py-3 text-ink placeholder:text-ink-muted/70 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-accent px-6 py-3 font-display text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60 sm:self-end"
        >
          {pending ? t.order.submitting : t.order.submit}
        </button>
      </form>
      {state.error && (
        <p className="mt-3 rounded-xl border border-role-marketing/40 bg-role-marketing/10 px-4 py-2.5 text-sm text-role-marketing">
          {state.error}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        {t.order.hint}
      </p>
    </section>
  );
}
