import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenciaWidget } from './preferencia-widget.entity';
import { PreferenciaWidgetService } from './preferencia-widget.service';
import { PreferenciaWidgetController } from './preferencia-widget.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PreferenciaWidget])],
  controllers: [PreferenciaWidgetController],
  providers: [PreferenciaWidgetService],
  exports: [PreferenciaWidgetService],
})
export class PreferenciaWidgetModule {}