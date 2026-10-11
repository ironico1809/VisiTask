import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuariosService, UsuarioItem } from './usuarios.service.js';
import { CrearUsuarioDto, ActualizarUsuarioDto, ActualizarPerfilDto } from './dto/crear-usuario.dto.js';

function extraerUsuarioDeCabecera(authHeader?: string): string | undefined {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  const token = authHeader.split(' ')[1];
  try {
    const base64Payload = token.split('.')[1];
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const json = JSON.parse(payloadStr);
    return json?.email || json?.correo || json?.sub;
  } catch {
    return undefined;
  }
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  async obtenerPerfil(@Headers('authorization') authHeader?: string): Promise<UsuarioItem> {
    const usuarioIdentificador = extraerUsuarioDeCabecera(authHeader);
    return this.usuariosService.obtenerPerfil(usuarioIdentificador);
  }

  @Put('perfil')
  async actualizarPerfil(
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: ActualizarPerfilDto,
  ): Promise<UsuarioItem> {
    const usuarioIdentificador = extraerUsuarioDeCabecera(authHeader);
    return this.usuariosService.actualizarPerfil(usuarioIdentificador, dto);
  }

  @Get()
  async listar(
    @Query('rol') rol?: string,
    @Query('organizacionId') organizacionId?: string,
  ): Promise<UsuarioItem[]> {
    return this.usuariosService.listarTodos(rol, organizacionId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string): Promise<UsuarioItem> {
    return this.usuariosService.obtenerPorId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearUsuarioDto): Promise<UsuarioItem> {
    return this.usuariosService.crear(dto);
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
  ): Promise<UsuarioItem> {
    return this.usuariosService.actualizar(id, dto);
  }

  @Patch(':id/rol')
  async cambiarRol(
    @Param('id') id: string,
    @Body('rol') nuevoRol: string,
  ): Promise<UsuarioItem> {
    return this.usuariosService.cambiarRol(id, nuevoRol);
  }

  @Patch(':id/activo')
  async cambiarEstadoActivo(
    @Param('id') id: string,
    @Body('activo') activo: boolean,
  ): Promise<UsuarioItem> {
    return this.usuariosService.cambiarEstadoActivo(id, activo);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    return this.usuariosService.eliminar(id);
  }
}
