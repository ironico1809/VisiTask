import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { OrganizacionesModule } from './modules/organizaciones/organizaciones.module.js';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';
import { ConsentimientoModule } from './modules/consentimiento/consentimiento.module.js';
import { SuscripcionesModule } from './modules/suscripciones/suscripciones.module.js';
import { AlertasModule } from './modules/alertas/alertas.module.js';
import { AuditoriaModule } from './modules/auditoria/auditoria.module.js';
import { ReportesModule } from './modules/reportes/reportes.module.js';
import { SupervisionModule } from './modules/supervision/supervision.module.js';
import { ErgonomiaModule } from './modules/ergonomia/ergonomia.module.js';

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
    SuscripcionesModule,
    AlertasModule,
    AuditoriaModule,
    ReportesModule,
    SupervisionModule,
    ErgonomiaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
