import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET')
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { id, email } = payload;
        const user = await this.userModel.findById(id);
        if (!user) throw new UnauthorizedException('Token not valid');
        if (!user.isActive) throw new UnauthorizedException('User is not active');
        return user;
    }
}