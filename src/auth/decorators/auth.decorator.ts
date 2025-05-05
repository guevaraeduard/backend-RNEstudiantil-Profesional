import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';
import { AuthGuard } from '@nestjs/passport';


export function Auth(role?: ValidRoles) {
  return applyDecorators(
    RoleProtected(role),
    UseGuards(AuthGuard(), UserRoleGuard)
  );
}
