import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Override handleRequest to never throw an error if no token is provided.
    // It simply returns the user if token is valid, or null if no token is provided / token is invalid.
    handleRequest(err: any, user: any) {
        if (err || !user) {
            return null;
        }
        return user;
    }
}
