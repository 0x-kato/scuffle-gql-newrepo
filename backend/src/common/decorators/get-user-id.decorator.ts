import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../types';

export const GetCurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): number => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req?.user as JwtPayload;

    console.log(user?.sub);
    return user?.sub;
  },
);
