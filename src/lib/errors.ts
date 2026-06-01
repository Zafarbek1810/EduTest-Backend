export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Topilmadi') {
    super(404, message, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Avtorizatsiya talab qilinadi') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Ruxsat yo\'q') {
    super(403, message, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Konflikt') {
    super(409, message, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Noto\'g\'ri ma\'lumot') {
    super(400, message, 'VALIDATION');
  }
}
