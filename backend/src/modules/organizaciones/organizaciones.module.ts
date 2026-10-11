import { Module } from '@nestjs/common';
import { OrganizacionesController } from './organizaciones.controller.js';
import { OrganizacionesService } from './organizaciones.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
