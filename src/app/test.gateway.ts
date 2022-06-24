import { UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { from, Observable, Subject } from 'rxjs';
import { filter, map, startWith, withLatestFrom } from 'rxjs/operators';
import { Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from './shared/redis-propagator/redis-propagator.interceptor';
import { RedisPropagatorService } from './shared/redis-propagator/redis-propagator.service';

@UseInterceptors(RedisPropagatorInterceptor)
@WebSocketGateway({ cors: true })
export class EventsGateway {
  params$ = new Subject();

  constructor(private redisService: RedisPropagatorService) {}

  @SubscribeMessage('changeParams')
  ddddd() {
    console.log('CHANGE_PARAMETER');

    this.params$.next('d');

    return { event: 'ds', data: 'd' };
  }

  @SubscribeMessage('setPreferencias')
  public findAll(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Observable<any> {
    console.log(data);
    // console.log(client);

    return this.redisService.listenSendName$.pipe(
      filter((eventKakfa) => {
        return true;
      }),
      map((message, i) => {
        return { event: 'events1', data: { message, prefrencias: data } };
      }),
    );
  }
}
