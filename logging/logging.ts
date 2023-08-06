import { getCombinedContext } from "../context/mod.ts";

export enum Level {
  TRACE,
  DEBUG,
  INFO,
  ALERT,
  WARNING,
  CRITICAL,
}

export interface LoggingData {
  name: string;
  timestamp: string;
  level: string;
  context: Record<string, unknown>;
  message: string;
  args: unknown[];
}

export interface LoggingFormat {
  format(data: LoggingData): string;
}

export interface LoggingOutput {
  output(data: string): void;
}

export interface LoggerOutput {
  minLevel?: number;
  format: LoggingFormat;
  output: LoggingOutput;
}

export interface LoggingConfiguration {
  outputs: LoggerOutput[];
  minLevel: Level;
}

export class Logger {
  static #main = new Logger(
    "main",
    {
      minLevel: Level.TRACE,
      outputs: [],
    },
    [],
  );

  static configure(configurer: (logger: Logger) => unknown) {
    configurer(this.#main);
  }

  static for(name: string): Logger {
    return new Logger(
      name,
      Logger.#main.#configuration,
      this.#main.#contexts,
    );
  }

  #name: string;
  #configuration: LoggingConfiguration;
  #contexts: string[] = [];

  public get name() {
    return this.#name;
  }

  public get level() {
    return this.#configuration.minLevel;
  }

  public set level(level: Level) {
    this.#configuration.minLevel = level;
  }

  protected constructor(
    name: string,
    configuration: LoggingConfiguration,
    contexts: string[],
  ) {
    this.#name = name;
    this.#configuration = configuration;
    this.#contexts = contexts;
  }

  /**
   * Add an output.
   * @param output The output object.
   * @returns Self, for chaining purposes.
   */
  public addOutput(output: LoggerOutput): this {
    this.#configuration.outputs.push(output);
    return this;
  }

  /**
   * Associate the logger with one or more context IDs.
   * @param ids The context IDs to associate with.
   * @returns Self, for chaining purposes.
   */
  public addContext(...ids: string[]): this {
    for (const id of ids) {
      if (this.#contexts.indexOf(id) === -1) {
        this.#contexts.push(id);
      }
    }
    return this;
  }

  /**
   * Disassociate the logger with one or more context IDs.
   * @param ids The context IDs to disassociate.
   * @returns Self, for chaining purposes.
   */
  public removeContext(...ids: string[]): this {
    for (const id of ids) {
      const index = this.#contexts.indexOf(id);
      if (index === -1) continue;
      this.#contexts.splice(index, 1);
    }
    return this;
  }

  public hasSomeContexts(...ids: string[]): boolean {
    return ids.some((id) => this.#contexts.indexOf(id) !== -1);
  }

  public hasAllContexts(...ids: string[]): boolean {
    return ids.every((id) => this.#contexts.indexOf(id) !== -1);
  }

  #output(level: string, message: string, args: unknown[]) {
    const timestamp = new Date().toJSON();
    // deno-lint-ignore no-explicit-any
    if (this.#configuration.minLevel > (Level as any)[level]) {
      return;
    }
    this.#configuration.outputs.forEach((config) => {
      if (
        // deno-lint-ignore no-explicit-any
        config.minLevel !== undefined && config.minLevel > (Level as any)[level]
      ) {
        return;
      }
      config.output.output(config.format.format({
        name: this.name,
        timestamp,
        level,
        message,
        args,
        context: getCombinedContext(this.#contexts),
      }));
    });
  }

  static #argumentize(
    ...args: unknown[]
  ): [message: string, args: unknown[]] {
    if (args.length === 0) return ["", []];
    if (typeof args[0] === "string") return [args.shift() as string, args];
    return [",%i".repeat(args.length).substring(1), args];
  }

  // Levels

  public trace(...args: unknown[]) {
    this.#output("TRACE", ...Logger.#argumentize(...args));
    return this;
  }

  public debug(...args: unknown[]) {
    this.#output("DEBUG", ...Logger.#argumentize(...args));
    return this;
  }

  public info(...args: unknown[]) {
    this.#output("INFO", ...Logger.#argumentize(...args));
    return this;
  }

  public alert(...args: unknown[]) {
    this.#output("ALERT", ...Logger.#argumentize(...args));
    return this;
  }

  public warning(...args: unknown[]) {
    this.#output("WARNING", ...Logger.#argumentize(...args));
    return this;
  }

  public warn(...args: unknown[]) {
    return this.warning(...args);
  }

  public critical(...args: unknown[]) {
    this.#output("CRITICAL", ...Logger.#argumentize(...args));
    return this;
  }
}
