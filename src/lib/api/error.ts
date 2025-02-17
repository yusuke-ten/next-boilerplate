import createHttpError, { isHttpError } from 'http-errors';
import { NextResponse } from 'next/server';

// エラータイプの定義
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  BUSINESS = 'BUSINESS',
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
}

// エラータイプとステータスコードのマッピング
export const ErrorStatusMap: Record<ErrorType, number> = {
  [ErrorType.AUTHENTICATION]: 401,
  [ErrorType.AUTHORIZATION]: 403,
  [ErrorType.BUSINESS]: 422,
  [ErrorType.EXTERNAL]: 502,
  [ErrorType.INTERNAL]: 500,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.VALIDATION]: 400,
};

interface ErrorResponse {
  details?: unknown;
  error: string;
  errorType?: ErrorType;
  message: string;
  stack?: string;
  statusCode: number;
}

// エラー作成用のユーティリティ関数
export const createAppError = (type: ErrorType, message: string, details?: unknown) => {
  const error = createHttpError(ErrorStatusMap[type], message);
  return Object.assign(error, { details, errorType: type });
};

// エラーハンドリング関数
export function handleApiError(err: unknown) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // HttpErrorの場合
  if (isHttpError(err)) {
    const response: ErrorResponse = {
      error: err.message,
      message: '',
      statusCode: err.status,
    };

    if ('errorType' in err) {
      response.errorType = err.errorType as ErrorType;
    }
    if ('details' in err) {
      response.details = err.details;
    }
    if (isDevelopment) {
      response.stack = err.stack;
      console.error('エラーの詳細:', {
        ...response,
        name: err.name,
        stack: err.stack,
      });
    }

    return NextResponse.json(response, { status: err.status });
  }

  // 予期せぬエラーの場合
  console.error('予期せぬエラー:', err);
  const response: ErrorResponse = {
    error: isDevelopment && err instanceof Error ? err.message : '不明なエラーが発生しました',
    message: '',
    statusCode: 500,
    ...(isDevelopment && err instanceof Error && { stack: err.stack }),
  };

  if (isDevelopment) {
    console.error('エラーの詳細:', {
      ...response,
      ...(err instanceof Error && {
        name: err.name,
        stack: err.stack,
      }),
    });
  }

  return NextResponse.json(response, { status: 500 });
}

// 各種エラー作成用のユーティリティ関数
export const createNotFoundError = (path: string) => {
  return createAppError(ErrorType.NOT_FOUND, `path ${path} not found`);
};

export const createValidationError = (details: unknown) => {
  return createAppError(ErrorType.VALIDATION, 'バリデーションエラー', details);
};

export const createAuthError = (message = '認証が必要です') => {
  return createAppError(ErrorType.AUTHENTICATION, message);
};

export const createForbiddenError = (message = 'アクセス権限がありません') => {
  return createAppError(ErrorType.AUTHORIZATION, message);
};

export const createBusinessError = (message: string, details?: unknown) => {
  return createAppError(ErrorType.BUSINESS, message, details);
};

export const createExternalError = (message: string, details?: unknown) => {
  return createAppError(ErrorType.EXTERNAL, message, details);
};
