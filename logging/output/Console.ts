import { LoggingOutput } from "../../logging.ts";

const e = new TextEncoder();

export const ConsoleOutput: LoggingOutput = {
  output(data) {
    Deno.stdout.write(e.encode(data));
  },
};

export default ConsoleOutput;
