import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseGateway } from './core/base/base.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BaseGateway],
})
export class AppModule {}
