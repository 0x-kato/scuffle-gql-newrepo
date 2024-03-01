import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetCurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): number | null => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    // Ensure the user object exists and contains 'userId'
    return request.user ? request.user.userId : null;
  },
);
