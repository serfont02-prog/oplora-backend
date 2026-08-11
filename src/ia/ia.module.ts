import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { ClaudeService } from './claude.service';

@Module({
  providers: [IaService, ClaudeService],
  exports: [IaService, ClaudeService],
})
export class IaModule {}