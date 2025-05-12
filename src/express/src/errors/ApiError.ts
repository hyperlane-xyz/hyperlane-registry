export class ApiError extends Error {
  public status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}
