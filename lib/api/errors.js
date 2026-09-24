/** Error with an HTTP status and a message that is safe to show to users. */
export class AppError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
    this.expose = true;
  }
}
