import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { OposicionService } from './oposicion.service';
import { CreateOposicionDto, UpdateOposicionDto } from './oposicion.dto';

@Controller('oposiciones')
export class OposicionController {
  constructor(private readonly service: OposicionService) {}

  @Delete(':id')
  eliminar(@Param('id') id: string) {
  return this.service.eliminar(id);
}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get('count')
async count() {
  const total = await this.service.count();
  return total;
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOposicionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOposicionDto) {
    return this.service.update(id, dto);
  }

}
