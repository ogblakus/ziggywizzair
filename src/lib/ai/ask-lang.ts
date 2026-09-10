import type { Locale } from "@/lib/i18n/catalog";

const PL_CHARS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
const PL_STEMS =
  /podstaw|otworz|dlaczego|czemu|pozycj|zamkn|wiadomoś|prosz[eę]|możesz|mozesz|gotówk|kapita[lł]|zlecen|portfel|kupi[ćc]|sprzeda|krótk|na jakiej|co się dzieje|co sie dzieje|ile koszt|z jakiego|weszli|wzi[eę]/i;

export function looksPolish(text: string): boolean {
  return PL_CHARS.test(text) || PL_STEMS.test(text);
}

/** Settings locale wins; a clearly Polish question still forces Polish. */
export function replyLocale(explicit: Locale | undefined, question: string): Locale {
  if (looksPolish(question)) return "pl";
  return explicit === "pl" ? "pl" : "en";
}

export function isWhyOpenedQuestion(q: string): boolean {
  return /why.+(open|bought|long|short|trade|position)|on what basis|rationale|na jakiej|podstaw|dlaczego|czemu.+(otworz|kup|wesz|pozycj)|otworzy[lł]|z jakiego powodu|kto (to )?(otworz|kupi)|who (opened|bought|put us)/i.test(
    q,
  );
}

/** LLM ignored the Polish instruction — dump the English slogan, use the local desk. */
export function isEnglishLeak(text: string, locale: Locale): boolean {
  if (locale !== "pl") return false;
  if (PL_CHARS.test(text)) return false;
  return /\b(hold the thesis|i add on dips|from the open|i do not chase|book is long|book is short|watch the tape|that's the add|if it rips)\b/i.test(
    text,
  );
}

/** "Why did you open X?" answered with a live RSI dump and no fill/vote. */
export function missedWhyOpened(question: string, answer: string): boolean {
  if (!isWhyOpenedQuestion(question)) return false;
  return !/(voted|vote was|council|fill @|fill:|opened by|autopilot|manual|głosowa|glosowa|rada |otworzy[lła]|zlecen|sam otworz|tezę z rady|teze z rady|głos |glos |wpis |źródł|zrodl|rationale)/i.test(
    answer,
  );
}
