import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GlobalResponse } from '../models/global-response.model';

@Injectable()
export class GlobalResponseInterceptor<T>
  implements NestInterceptor<T, GlobalResponse>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<GlobalResponse> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map(
        (data) =>
          new GlobalResponse({
            statusCode: response.statusCode,
            success: true,
            path: request.url,
            error: null,
            data,
          }),
      ),
    );
  }
}
