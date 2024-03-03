import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetCurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): number => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.user.userId;
  },
);
