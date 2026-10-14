import { Module } from '@nestjs/common';
import { SupervisionController } from './supervision.controller.js';
import { SupervisionService } from './supervision.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuditoriaModule } from '../auditoria/auditoria.module.js';

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [SupervisionController],
  providers: [SupervisionService],
  exports: [SupervisionService],
})
export class SupervisionModule {}
