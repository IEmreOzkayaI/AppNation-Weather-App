import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { Observable, map } from 'rxjs';

class _SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor<any>) {}
  intercept(_: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

export const SerializeInterceptor = (dto: ClassConstructor<any>) => UseInterceptors(new _SerializeInterceptor(dto));
