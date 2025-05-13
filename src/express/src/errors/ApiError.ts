export class ApiError extends Error {
  public status: number;
  public stack?: string;

  constructor(message: string, status = 500, stack?: string) {
    super(message);
    this.status = status;
    this.stack = stack;
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}
