import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export const getCookie = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const result = request.cookies?.[data];

  if (!result) {
    throw new UnauthorizedException("Please Sign-in before sending a request");
  }

  return result;
});
