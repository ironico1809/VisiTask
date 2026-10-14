import { Module } from '@nestjs/common';
import { ErgonomiaController } from './ergonomia.controller.js';
import { ErgonomiaService } from './ergonomia.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuditoriaModule } from '../auditoria/auditoria.module.js';

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [ErgonomiaController],
  providers: [ErgonomiaService],
  exports: [ErgonomiaService],
})
export class ErgonomiaModule {}
