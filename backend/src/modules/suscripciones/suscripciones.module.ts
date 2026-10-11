import { Module } from '@nestjs/common';
import { SuscripcionesController } from './suscripciones.controller.js';
import { SuscripcionesService } from './suscripciones.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService],
  exports: [SuscripcionesService],
})
export class SuscripcionesModule {}
