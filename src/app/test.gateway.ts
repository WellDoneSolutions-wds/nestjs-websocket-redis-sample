import { UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { from, Observable, Subject } from 'rxjs';
import { map, startWith, withLatestFrom } from 'rxjs/operators';
import { Socket } from 'socket.io';
import { RedisPropagatorInterceptor } from './shared/redis-propagator/redis-propagator.interceptor';
import { RedisPropagatorService } from './shared/redis-propagator/redis-propagator.service';

// @UseInterceptors(RedisPropagatorInterceptor)
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

  @SubscribeMessage('revei')
  public findAll(@ConnectedSocket() client: Socket): Observable<any> {
    // this.redisService.propagateEvent({
    //   data: { a: 'x' },
    //   event: 'revei',
    //   socketId: client.id,
    //   userId: 'd',
    // });

    console.log('RECEIVE');

    return this.redisService.listenSendName$.pipe(
      // withLatestFrom(this.params$),
      // startWith({}),
      map((message, i) => {
        console.log(`lllllllllll`, i);

        return { event: 'events1', data: message };
      }),
    );

    // return from([1, 2, 3]).pipe(
    //   map((item) => {
    //     return { event: 'events', data: item };
    //   }),
    // );
  }
}
