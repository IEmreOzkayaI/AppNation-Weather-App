import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalResponse } from '../models/global-response.model';
import { Logger } from 'nestjs-pino';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const globalResponse = new GlobalResponse({
      statusCode: null,
      success: false,
      path: request.url,
      error: null,
      data: null,
    });

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      if (exception.getStatus() === 490) {
        globalResponse.error = {
          message: 'Internal Server Error',
          type: 'External Error',
        };
      } else {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const exceptionMessage = (exceptionResponse as any).message || 'An error occurred';

        globalResponse.error = {
          message: Array.isArray(exceptionMessage) ? exceptionMessage[0] : exceptionMessage,
          type: 'Error',
        };
      }
    } else if (exception instanceof Error && (exception.name.startsWith('PrismaClient') || exception.message.includes('Prisma'))) {
      globalResponse.error = {
        message: 'Internal Server Error',
        type: 'Database Error',
      };
    } else {
      const errorMessage = this.extractErrorMessage(exception);
      globalResponse.error = {
        message: errorMessage || 'Internal Server Error',
        type: 'Internal Error',
      };
    }

    globalResponse.statusCode = status;

    this.logger.error(
      JSON.stringify(
        {
          errorMessage: exception instanceof Error ? exception.message : exception,
          path: request.url,
          method: request.method,
          status,
          host: request.headers.host,
          stack: (exception as Error)?.stack,
          headers: {
            ...request.headers,
          },
        },
        null,
        2,
      ),
    );

    // Yanıtı gönder
    response.status(globalResponse.statusCode).json(globalResponse);
  }

  private extractErrorMessage(exception: any): string {
    return (
      exception?.response?.data ||
      exception?.request?.data ||
      exception?.response?.message ||
      (exception instanceof HttpException ? exception.message : exception instanceof Error ? exception.message : 'Internal Server Error')
    );
  }
}
