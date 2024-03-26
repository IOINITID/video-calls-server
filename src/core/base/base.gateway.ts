import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(80)
export class BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(BaseGateway.name);

  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('Socket server started...');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.emit('client:base:connect');
  }

  @SubscribeMessage('server:base:ping')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: number,
  ) {
    const clientTimestamp = payload;
    const serverTimestamp = Date.now();
    const ping = serverTimestamp - clientTimestamp;

    client.emit('client:base:ping', ping);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    client.emit('client:base:disconnect');
  }
}
