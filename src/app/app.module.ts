import { Module } from '@nestjs/common';
import { AppController } from './AppController';

import { SharedModule } from './shared/shared.module';
import { EventsGateway } from './test.gateway';

@Module({
  imports: [SharedModule],
  providers: [EventsGateway],
  controllers: [AppController],
})
export class AppModule {}
