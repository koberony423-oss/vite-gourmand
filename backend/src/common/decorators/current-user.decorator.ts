import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: 'utilisateur' | 'employe' | 'administrateur';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
