import "server-only";

type Variable = "APP_URL" | "DATABASE_URL" | "DATABASE_POOL_SIZE";
type Problem = "missing" | "invalid";

export class ConfigurationError extends Error {
  constructor(readonly variable: Variable, readonly problem: Problem) {
    super(`${variable}: ${problem}`);
  }
}
