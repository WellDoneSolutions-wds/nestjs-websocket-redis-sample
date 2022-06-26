import { UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Observable, Subject } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from './shared/redis-propagator/redis-propagator.interceptor';
import { RedisPropagatorService } from './shared/redis-propagator/redis-propagator.service';

@UseInterceptors(RedisPropagatorInterceptor)
@WebSocketGateway({ cors: true })
export class EventsGateway implements NestGateway {
  afterInit(server: any) {}
  handleConnection?: (...args: any[]) => {};
  handleDisconnect(client: any) {
    console.log('DISCONECT', client.id);
  }

  params$ = new Subject<{ socketId: string; params: any }>();

  constructor(private redisService: RedisPropagatorService) {}

  @SubscribeMessage('changeParams')
  ddddd(@MessageBody() params: any, @ConnectedSocket() socket: Socket) {
    this.params$.next({ socketId: socket.id, params });
  }

  @SubscribeMessage('listenChanges')
  public findAll(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ): Observable<any> {
    return this.redisService.listenSendName$.pipe(
      withLatestFrom(
        this.params$.pipe(
          filter((params) => {
            console.log('---------------------');
            console.log('params.socketId', params.socketId);
            console.log('socket.id', socket.id);

            return params.socketId === socket.id;
          }),
        ),
      ),
      filter((eventKakfa) => {
        return true;
      }),
      map((message, i) => {
        console.log('xxxxxxxxxxxxxx', message);

        return { event: 'events1', data: { message, prefrencias: data } };
      }),
    );
  }
}
