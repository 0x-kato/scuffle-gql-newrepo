import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

//need to send PoolId to the resolver with this decorator
//pool id should be sent in the request body when clicking on pool in the frontend
export const GetPoolId = createParamDecorator(
  (_: unknown, context: ExecutionContext): number => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.body.poolId;
  },
);
