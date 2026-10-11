import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  correo: string;

  @IsString({ message: 'El nombre es obligatorio' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El apellido es obligatorio' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsString()
  @MinLength(5, { message: 'La contraseña debe tener al menos 5 caracteres' })
  clave: string;

  @IsString({ message: 'El rol debe ser una cadena válida' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  rol: string;

  @IsString()
  @IsOptional()
  organizacionId?: string;

  @IsString()
  @IsOptional()
  nombreOrganizacion?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;
}

export class ActualizarUsuarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  rol?: string;

  @IsString()
  @IsOptional()
  organizacionId?: string;

  @IsString()
  @IsOptional()
  nombreOrganizacion?: string;

  @IsString()
  @IsOptional()
  departamento?: string;

  @IsOptional()
  activo?: boolean;

  @IsString()
  @IsOptional()
  fotoUrl?: string;

  @IsString()
  @IsOptional()
  clave?: string;
}

export class ActualizarPerfilDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @IsString()
  @IsOptional()
  claveActual?: string;

  @IsString()
  @IsOptional()
  claveNueva?: string;

  @IsString()
  @IsOptional()
  fotoUrl?: string;
}
