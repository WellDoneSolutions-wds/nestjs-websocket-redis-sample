import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import socketio, { ServerOptions } from 'socket.io';
import { RedisPropagatorService } from '../redis-propagator/redis-propagator.service';

import { SocketStateService } from './socket-state.service';

interface TokenPayload {
  readonly userId: string;
}

export interface AuthenticatedSocket extends socketio.Socket {
  auth: TokenPayload;
}

export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  public constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
    private readonly redisPropagatorService: RedisPropagatorService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: `redis://localhost:6379`,
      password: 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
    });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }

  public create(port: number, options = {}): socketio.Server {
    const server = super.createIOServer(port, options);
    this.redisPropagatorService.injectSocketServer(server);

    // const wrapMiddlewareForSocketIo = middleware => (socket, next) => middleware(socket.request, {}, next);

    // server.use(wrapMiddlewareForSocketIo(passport.initialize()));
    // server.use(wrapMiddlewareForSocketIo(passport.authenticate(['jwt'])));
    server.use(async (socket: AuthenticatedSocket, next) => {
      const token =
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization;
      console.log('XXXXXXXXXXXXXXX');

      if (!token) {
        console.log('Xddddddddddddddddd');

        socket.auth = null;

        // not authenticated connection is still valid
        // thus no error
        return next();
      }

      try {
        console.log('Xvvvvvvvvvvd');

        // fake auth
        socket.auth = {
          userId: 'kenyi.lopez',
          // company:'id',
        };

        return next();
      } catch (e) {
        return next(e);
      }
    });

    return server;
  }

  public bindClientConnect(server: socketio.Server, callback: Function): void {
    server.on('connection', (socket: AuthenticatedSocket) => {
      if (socket.auth) {
        this.socketStateService.add(socket.auth.userId, socket);

        socket.on('disconnect', () => {
          this.socketStateService.remove(socket.auth.userId, socket);

          socket.removeAllListeners('disconnect');
        });
      }

      callback(socket);
    });
  }
}
