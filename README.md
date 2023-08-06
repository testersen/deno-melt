# MELT (Metrics, Events, Logs, Tracing)

A library that attempts to be OTel compatible.

## Features

- [x] Contexts
- [ ] Metrics
- [ ] Events
- [x] Logs
- [ ] Tracing

## Contexts

```ts
import {
  contextPut,
  createContext,
  deleteContext,
} from "https://deno.land/x/melt/mod.ts";
```

Contexts can be used for sharing attributes between MELT.

## Logging

```ts
import {
  ConsoleOutput,
  JasonFormat,
  Level,
  Logger,
} from "https://deno.land/x/melt/mod.ts";

Logger.configure((main) => {
  main.level = Level.INFO;
  main.addOutput({
    output: ConsoleOutput,
    format: JasonFormat,
  });
});

const ctxId = createContext();

const log = Logger.for("app").addContext(ctxId);

log.info("Hello");
```
