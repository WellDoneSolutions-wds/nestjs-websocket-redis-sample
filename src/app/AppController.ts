import { Controller, Get } from '@nestjs/common';
import { RedisPropagatorService } from './shared/redis-propagator/redis-propagator.service';

@Controller('/prueba')
export class AppController {
  constructor(private redisService: RedisPropagatorService) {}

  @Get()
  gege() {
    console.log('SENDSSSS');

    this.redisService.propagateEvent({
      data: {},
      socketId: 'dd',
      event: '',
      userId: 's',
    });
    return 'OK';
  }
}
