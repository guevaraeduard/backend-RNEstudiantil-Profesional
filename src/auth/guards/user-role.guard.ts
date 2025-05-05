
import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {


  constructor(private readonly reflector: Reflector) {}


  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
   const validRoles: string = this.reflector.get(META_ROLES, context.getHandler());
   if(!validRoles){
    return true;
   }
   const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if(validRoles === user.role){
      return true;
    }

    throw new ForbiddenException(`User ${user.email} is not authorized to access this resource`);
  
  }
}
