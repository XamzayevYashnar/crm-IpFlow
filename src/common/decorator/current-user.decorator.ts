import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { IPayload } from "../interface/interface-payload";

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): IPayload => {
  const request = ctx.switchToHttp().getRequest<Request & { user: IPayload }>();
  return request.user;
});
