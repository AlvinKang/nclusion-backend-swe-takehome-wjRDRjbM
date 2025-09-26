export function isAppError(err: unknown): err is Error {
  return (
    err instanceof ValidationError ||
    err instanceof NotFoundError ||
    err instanceof ConflictError
  );
}

export type AppError = ValidationError | NotFoundError | ConflictError;

export class ValidationError extends Error {
  name = "ValidationError";
  status = 400;
}

export class NotFoundError extends Error {
  name = "NotFoundError";
  status = 404;
}

export class ConflictError extends Error {
  name = "ConflictError";
  status = 409;
}
