import { useState } from "react";
import { useLang } from "../i18n";
import { LISTS_SAMPLE, listsPrompt, profilePrompt, type ProfileInput } from "../prompts";
import { toast } from "../ui";
import { Icon } from "./Icon";

type Id = "profile" | "lists";

/** The two prompts, each with copy and an in-place preview. The text is
 * built when it is needed, not on every render of the page. */
export function Prompts({ input }: { input: ProfileInput }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<Id | null>(null);
  const [copied, setCopied] = useState<Id | null>(null);

  const text = (id: Id) => (id === "profile" ? profilePrompt(input, lang) : listsPrompt(input.login, input.recent, lang));
  const items: { id: Id; title: string; hint: string }[] = [
    { id: "profile", title: t.promptProfile, hint: t.promptProfileHint },
    { id: "lists", title: t.promptLists, hint: t.promptListsHint(Math.min(LISTS_SAMPLE, input.recent.length)) },
  ];

  const copy = async (id: Id) => {
    try {
      await navigator.clipboard.writeText(text(id));
    } catch {
      toast(t.copyFailed, "error");
      return;
    }
    setCopied(id);
    toast(t.copied);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  return (
    <ul className="q-rows prompts">
      {items.map((p) => (
        <li key={p.id}>
          <div className="q-row">
            <span className="q-row-main">
              <span>{p.title}</span>
              <span>{p.hint}</span>
            </span>
            <button type="button" className="q-btn q-btn--quiet q-btn--sm" aria-expanded={open === p.id} onClick={() => setOpen(open === p.id ? null : p.id)}>
              {open === p.id ? t.hide : t.preview}
            </button>
            <button type="button" className="q-btn q-btn--sm" onClick={() => copy(p.id)}>
              <Icon name={copied === p.id ? "check" : "copy"} small />
              {copied === p.id ? t.copied : t.copy}
            </button>
          </div>
          {open === p.id && <pre className="prompt-text q-rise">{text(p.id)}</pre>}
        </li>
      ))}
    </ul>
  );
}
