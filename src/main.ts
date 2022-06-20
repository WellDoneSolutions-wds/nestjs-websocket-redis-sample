import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { RedisPropagatorService } from './app/shared/redis-propagator/redis-propagator.service';
import { SocketStateAdapter } from './app/shared/socket-state/socket-state.adapter';
import { SocketStateService } from './app/shared/socket-state/socket-state.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const socketStateService = app.get(SocketStateService);
  const redisPropagatorService = app.get(RedisPropagatorService);

  const adapter = new SocketStateAdapter(
    app,
    socketStateService,
    redisPropagatorService,
  );

  await adapter.connectToRedis();

  app.useWebSocketAdapter(adapter);

  app.enableCors();
  await app.listen(4000, () => {
    console.log(`Listening on port 3000.`);
  });
}

bootstrap();
