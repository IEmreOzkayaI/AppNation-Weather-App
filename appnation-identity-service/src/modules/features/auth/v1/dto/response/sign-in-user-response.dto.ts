import { Expose, Transform } from "class-transformer";

export class SignInUserResponseDTO {
    @Expose()
    @Transform(({ obj }) => obj.userAccount.id)
    id:string;
    
    @Expose()
    @Transform(({ obj }) => obj.userAccount.deviceId)
    deviceId:string;

    @Expose()
    @Transform(({ obj }) => obj.userAccount.account.role)
    role:string;

    @Expose()
    @Transform(({ obj }) => obj.accessToken)
    accessToken:string;
}