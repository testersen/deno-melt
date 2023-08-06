import { LoggingFormat } from "../logging.ts";

export const JasonFormat: LoggingFormat = {
  format({ args, context, level, message, name, timestamp }) {
    delete context["timestamp"];
    delete context["level"];
    delete context["name"];
    delete context["message"];
    delete context["args"];

    return JSON.stringify({
      timestamp,
      level,
      name,
      message,
      args,
      ...context,
    }) + "\n";
  },
};

export default JasonFormat;
