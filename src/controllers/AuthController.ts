import { IUserRO } from 'model/types/IUser';
import { Body, Get, Post, Query, Route } from 'tsoa';
import { IAccessToken } from "utility/auth/IAccessToken";
import { Emailer } from "utility/email/Emailer";
import { ApiError } from 'utility/error/apiError';
import { ErrorCode } from 'utility/error/ErrorCode';
import { JWT } from "utility/JWT/JWT";
import { JWT_ACCESS_AUD, JWT_EMAIL_LINK_AUD, JWT_ISSUER } from "utility/JWT/JWTConstants";
import { ORM } from 'utility/ORM/ORM';

@Route("/auth")
export class AuthController {
  
  @Post("/login")
  public async sendMagicLink(  
    @Body() body: {
      /**
       * Identifiant de l'utilisateur.
       */
      email: string;
    }
  ): Promise<{ ok: boolean}> {    
    // Vérifier si on a un utilisateur avec l'adresse email dans notre base
    const user = await ORM.Read<IUserRO>({
      table: 'user',
      idKey: 'email',
      idValue: body.email,
      columns: ['userId', 'email']
    });

   
    // Create the new JWT
    const jwt = new JWT();
    const encoded = await jwt.create({
      userId: user.userId,
    }, {
      expiresIn: '30 minutes',
      audience: JWT_EMAIL_LINK_AUD,
      issuer: JWT_ISSUER
    }) as string;
    
    const emailer = new Emailer();

    const link = (process.env.FRONT_URL || 'http://localhost:' + (process.env.PORT || 5055)) + '/auth/authorize?jwt=' + encodeURIComponent(encoded);
    await emailer.sendMagicLink(body.email, link, 'Mon service');

    return {
      ok: true
    };
  }

  @Get("/authorize")
  public async authorizeFromLink(  
    @Query() jwt: string
  ): Promise<{ 
    access: string;
    redirectTo: string;
    message: string;
  }> {    
        
    const helper = new JWT();
    const decoded = await helper.decodeAndVerify(jwt, {
      issuer: JWT_ISSUER,
      audience: JWT_EMAIL_LINK_AUD,
    });

    if (!decoded.userId) {
      throw new ApiError(ErrorCode.Unauthorized, 'auth/invalid-authorize-link-token', "userId was not found in the payload for token");
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await ORM.Read<IUserRO>({
      table: 'user',
      idKey: 'userId',
      idValue: decoded.userId,
      columns: ['userId']
    });

    let payload: IAccessToken = {
      userId: user.userId
      /** @todo: Ajouter des rôle(s) ici ! */
    };    

    const access = await helper.create(payload, {
      expiresIn: '12 hours',
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUD,
    }) as string;

    return {
      access: access,
      redirectTo: 'https://lien.vers.mon.front',
      message: 'Normalement ce endpoint va demander au navigateur de rediriger vers votre site ou ressource'
    };
  }

}
