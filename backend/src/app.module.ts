import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { OrganizacionesModule } from './modules/organizaciones/organizaciones.module.js';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';
import { ConsentimientoModule } from './modules/consentimiento/consentimiento.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    OrganizacionesModule,
    UsuariosModule,
    ConsentimientoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
