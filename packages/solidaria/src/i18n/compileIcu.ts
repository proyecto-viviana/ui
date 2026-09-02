/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@internationalized/string-compiler/src/stringCompiler.js

// Grammar subset of @formatjs/icu-messageformat-parser consumed by compileString (no new dependency).

/**
 * Runtime port of `@internationalized/string-compiler`'s compileParts
 * (`packages/@internationalized/string-compiler/src/stringCompiler.js`).
 *
 * Upstream Parcel compiles each intl JSON string to a function (or leaves a
 * plain string when the message has no arguments). This port has no build-time
 * transform, so createStringFormatter compiles the same ICU subset on first
 * use: `{var}`, `{var, number}`, `{var, plural, …}` / `{var, selectordinal, …}`
 * with `#` and `offset:n`, `{var, select, …}`, nested arguments, and ICU
 * apostrophe escapes (`'{'`, `'}'`, `''`).
 *
 * Compiled functions match the call shape `LocalizedStringFormatter.format`
 * (the `@internationalized/string` dependency, not ported here) expects:
 * `(args, formatter) => string`, using formatter.plural / number / select.
 */

import type {
  LocalizedString,
  LocalizedStringFormatter,
  Variables,
} from "@internationalized/string";

type IcuFormatter = {
  plural: (
    count: number,
    options: Record<string, string | (() => string)>,
    type?: Intl.PluralRuleType,
  ) => string;
  number: (value: number) => string;
  select: (options: Record<string, string | (() => string)>, value: string) => string;
};

type ArgType = "" | "number" | "date" | "time" | "select" | "plural" | "selectordinal";

type Part =
  | { type: "literal"; value: string }
  | { type: "argument"; value: string }
  | { type: "number"; value: string }
  | { type: "pound" }
  | {
      type: "plural";
      value: string;
      offset: number;
      pluralType: Intl.PluralRuleType;
      options: Record<string, Part[]>;
    }
  | { type: "select"; value: string; options: Record<string, Part[]> };

function asFormatter(formatter: LocalizedStringFormatter<any, any> | undefined): IcuFormatter {
  if (!formatter) {
    throw new Error("ICU message requires a LocalizedStringFormatter");
  }
  return formatter as unknown as IcuFormatter;
}

function partsHaveArgs(parts: Part[]): boolean {
  return parts.some((part) => part.type !== "literal");
}

function joinLiterals(parts: Part[]): string {
  let out = "";
  for (const part of parts) {
    if (part.type === "literal") out += part.value;
  }
  return out;
}

function render(
  parts: Part[],
  args: Variables,
  formatter: IcuFormatter,
  hashValue: number,
): string {
  let out = "";
  for (const part of parts) {
    switch (part.type) {
      case "literal":
        out += part.value;
        break;
      case "argument":
        out += `${args?.[part.value]}`;
        break;
      case "number":
        out += formatter.number(Number(args?.[part.value]));
        break;
      case "pound":
        out += formatter.number(hashValue);
        break;
      case "plural": {
        const count = Number(args?.[part.value]) - part.offset;
        const options: Record<string, string | (() => string)> = {};
        for (const [selector, inner] of Object.entries(part.options)) {
          options[selector] = partsHaveArgs(inner)
            ? () => render(inner, args, formatter, count)
            : joinLiterals(inner);
        }
        out += formatter.plural(count, options, part.pluralType);
        break;
      }
      case "select": {
        const options: Record<string, string | (() => string)> = {};
        for (const [selector, inner] of Object.entries(part.options)) {
          options[selector] = partsHaveArgs(inner)
            ? () => render(inner, args, formatter, hashValue)
            : joinLiterals(inner);
        }
        out += formatter.select(options, `${args?.[part.value]}`);
        break;
      }
      default: {
        const _never: never = part;
        throw new Error(`Unsupported message type: ${(_never as Part).type}`);
      }
    }
  }
  return out;
}

class IcuParser {
  private readonly source: string;
  private index = 0;

  constructor(source: string) {
    this.source = source;
  }

  parse(): Part[] {
    return this.parseMessage(0, "");
  }

  private parseMessage(nestingLevel: number, parentArgType: ArgType): Part[] {
    const parts: Part[] = [];
    while (!this.isEof()) {
      const ch = this.char();
      if (ch === "{") {
        parts.push(this.parseArgument(nestingLevel));
      } else if (ch === "}" && nestingLevel > 0) {
        break;
      } else if (ch === "#" && (parentArgType === "plural" || parentArgType === "selectordinal")) {
        this.bump();
        parts.push({ type: "pound" });
      } else {
        parts.push(this.parseLiteral(nestingLevel, parentArgType));
      }
    }
    return parts;
  }

  private parseLiteral(nestingLevel: number, parentArgType: ArgType): Part {
    let value = "";
    while (true) {
      const quoted = this.tryParseQuote(parentArgType);
      if (quoted !== null) {
        value += quoted;
        continue;
      }
      const unquoted = this.tryParseUnquoted(nestingLevel, parentArgType);
      if (unquoted !== null) {
        value += unquoted;
        continue;
      }
      break;
    }
    return { type: "literal", value };
  }

  /**
   * ICU 4.8: an ASCII apostrophe starts quoted text only when it immediately
   * precedes a character that requires quoting (`'`, `{`, `}`, `<`, `>`, and
   * `#` inside plural/selectordinal).
   */
  private tryParseQuote(parentArgType: ArgType): string | null {
    if (this.isEof() || this.char() !== "'") return null;
    const next = this.peek();
    if (next === "'") {
      this.bump();
      this.bump();
      return "'";
    }
    const needsQuote =
      next === "{" ||
      next === "<" ||
      next === ">" ||
      next === "}" ||
      (next === "#" && (parentArgType === "plural" || parentArgType === "selectordinal"));
    if (!needsQuote) return null;

    this.bump();
    let out = this.char();
    this.bump();
    while (!this.isEof()) {
      const ch = this.char();
      if (ch === "'") {
        if (this.peek() === "'") {
          out += "'";
          this.bump();
          this.bump();
          continue;
        }
        this.bump();
        break;
      }
      out += ch;
      this.bump();
    }
    return out;
  }

  private tryParseUnquoted(nestingLevel: number, parentArgType: ArgType): string | null {
    if (this.isEof()) return null;
    const ch = this.char();
    if (
      ch === "{" ||
      (ch === "#" && (parentArgType === "plural" || parentArgType === "selectordinal")) ||
      (ch === "}" && nestingLevel > 0)
    ) {
      return null;
    }
    this.bump();
    return ch;
  }

  private parseArgument(nestingLevel: number): Part {
    const start = this.index;
    this.bump();
    this.skipSpace();
    if (this.isEof() || this.char() === "}") {
      throw new Error(`Empty ICU argument in "${this.source}"`);
    }
    const name = this.readIdentifier();
    if (!name) {
      throw new Error(`Malformed ICU argument in "${this.source.slice(start)}"`);
    }
    this.skipSpace();
    if (this.isEof()) {
      throw new Error(`Unclosed ICU argument "{${name}" in "${this.source}"`);
    }
    if (this.char() === "}") {
      this.bump();
      return { type: "argument", value: name };
    }
    if (this.char() !== ",") {
      throw new Error(`Malformed ICU argument "{${name}" in "${this.source}"`);
    }
    this.bump();
    this.skipSpace();
    return this.parseArgumentOptions(nestingLevel, name);
  }

  private parseArgumentOptions(nestingLevel: number, name: string): Part {
    const argType = this.readIdentifier() as ArgType;
    switch (argType) {
      case "number":
      case "date":
      case "time": {
        this.skipSpace();
        if (this.char() === ",") {
          this.bump();
          this.skipSimpleStyle();
        }
        this.expectClose(`{${name}, ${argType}}`);
        if (argType !== "number") {
          throw new Error(`Unsupported message type: ${argType}`);
        }
        return { type: "number", value: name };
      }
      case "plural":
      case "selectordinal":
      case "select": {
        this.skipSpace();
        if (this.char() !== ",") {
          throw new Error(`Expected ',' after ${argType} in "${this.source}"`);
        }
        this.bump();
        this.skipSpace();
        let offset = 0;
        let selector = this.readIdentifier();
        if (argType !== "select" && selector === "offset") {
          if (this.char() !== ":") {
            throw new Error(`Expected ':' after plural offset in "${this.source}"`);
          }
          this.bump();
          this.skipSpace();
          offset = this.readInteger();
          this.skipSpace();
          selector = this.readIdentifier();
        }
        const options = this.parsePluralOrSelectOptions(nestingLevel, argType, selector);
        this.expectClose(`{${name}, ${argType}}`);
        if (argType === "select") {
          return { type: "select", value: name, options };
        }
        return {
          type: "plural",
          value: name,
          offset,
          pluralType: argType === "plural" ? "cardinal" : "ordinal",
          options,
        };
      }
      default:
        throw new Error(`Unsupported message type: ${argType || "empty"}`);
    }
  }

  private parsePluralOrSelectOptions(
    nestingLevel: number,
    parentArgType: ArgType,
    firstSelector: string,
  ): Record<string, Part[]> {
    const options: Record<string, Part[]> = {};
    let selector = firstSelector;
    while (true) {
      if (!selector) {
        if (parentArgType !== "select" && this.char() === "=") {
          const start = this.index;
          this.bump();
          this.readInteger();
          selector = this.source.slice(start, this.index);
        } else {
          break;
        }
      }
      this.skipSpace();
      if (this.char() !== "{") {
        throw new Error(
          `Expected '{' for ${parentArgType} selector "${selector}" in "${this.source}"`,
        );
      }
      this.bump();
      options[selector] = this.parseMessage(nestingLevel + 1, parentArgType);
      if (this.char() !== "}") {
        throw new Error(`Unclosed ${parentArgType} option "${selector}" in "${this.source}"`);
      }
      this.bump();
      this.skipSpace();
      selector = this.readIdentifier();
    }
    if (Object.keys(options).length === 0) {
      throw new Error(`Expected ${parentArgType} selectors in "${this.source}"`);
    }
    return options;
  }

  private skipSimpleStyle(): void {
    let nested = 0;
    while (!this.isEof()) {
      const ch = this.char();
      if (ch === "'") {
        this.bump();
        while (!this.isEof() && this.char() !== "'") this.bump();
        if (!this.isEof()) this.bump();
        continue;
      }
      if (ch === "{") nested += 1;
      else if (ch === "}") {
        if (nested === 0) return;
        nested -= 1;
      }
      this.bump();
    }
  }

  private expectClose(label: string): void {
    this.skipSpace();
    if (this.char() !== "}") {
      throw new Error(`Unclosed ${label} in "${this.source}"`);
    }
    this.bump();
  }

  private readIdentifier(): string {
    const start = this.index;
    while (!this.isEof() && !/[\s,{}=:]/.test(this.char())) {
      this.bump();
    }
    return this.source.slice(start, this.index);
  }

  private readInteger(): number {
    const start = this.index;
    if (this.char() === "+" || this.char() === "-") this.bump();
    const digitStart = this.index;
    while (!this.isEof() && this.char() >= "0" && this.char() <= "9") this.bump();
    if (this.index === digitStart) {
      throw new Error(`Expected number in "${this.source}"`);
    }
    return Number(this.source.slice(start, this.index));
  }

  private skipSpace(): void {
    while (!this.isEof() && /\s/.test(this.char())) this.bump();
  }

  private char(): string {
    return this.source[this.index] ?? "";
  }

  private peek(): string {
    return this.source[this.index + 1] ?? "";
  }

  private bump(): void {
    this.index += 1;
  }

  private isEof(): boolean {
    return this.index >= this.source.length;
  }
}

/**
 * Compile an ICU message the way `@internationalized/string-compiler`
 * compileString does: functions for messages with arguments, the original
 * string (or the unescaped literal) otherwise. Already-compiled functions pass
 * through.
 */
export function compileIcu(message: LocalizedString): LocalizedString {
  if (typeof message === "function") return message;
  if (!message.includes("{")) return message;
  const parts = new IcuParser(message).parse();
  if (!partsHaveArgs(parts)) return joinLiterals(parts);
  return (args, formatter) => render(parts, args, asFormatter(formatter), 0);
}
