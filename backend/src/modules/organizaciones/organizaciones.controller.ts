import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { OrganizacionesService, OrganizacionItem } from './organizaciones.service.js';
import { CrearOrganizacionDto, ActualizarOrganizacionDto } from './dto/crear-organizacion.dto.js';

@Controller('organizaciones')
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Get()
  async listar(): Promise<OrganizacionItem[]> {
    return this.organizacionesService.listarTodas();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<OrganizacionItem> {
    return this.organizacionesService.obtenerPorId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearOrganizacionDto): Promise<OrganizacionItem> {
    return this.organizacionesService.crear(dto);
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarOrganizacionDto,
  ): Promise<OrganizacionItem> {
    return this.organizacionesService.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.organizacionesService.eliminar(id);
  }
}
