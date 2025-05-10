import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const ExtractUserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const userId = request.headers['x-user-id'];

  if (!userId) {
    throw new BadRequestException('x-user-id header is missing.');
  }

  return userId;
});
