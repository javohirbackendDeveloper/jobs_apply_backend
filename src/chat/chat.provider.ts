// chat.gateway.ts
import { forwardRef, Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { PrismaService } from 'prisma/prisma.service';
import { Server, Socket } from 'socket.io';
import { CompanyService } from 'src/company/company.service';
import { SendMessageDto } from 'src/company/dto/chat.dto';

@WebSocketGateway(4001, { cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prisma: PrismaService,
  ) {}
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.join(userId);
      console.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries()).find(
      ([_, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`Client disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: SendMessageDto) {
    try {
      const existing = await this.prisma.message.findFirst({
        where: {
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          messageText: payload.content,
          createdAt: {
            gt: new Date(Date.now() - 5000),
          },
        },
      });

      if (existing) {
        return { event: 'messageSent', status: 'duplicate' };
      }

      const message = await this.prisma.message.create({
        data: {
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          messageText: payload.content,
        },
      });

      this.server.to(payload.senderId).emit('messageSent', {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        messageText: message.messageText,
        createdAt: message.createdAt,
      });

      const receivedMessage = this.server
        .to(payload.receiverId)
        .emit('receiveMessage', {
          id: message.id,
          senderId: message.senderId,
          messageText: message.messageText,
          createdAt: message.createdAt,
        });

      return { event: 'messageSent', status: 'success' };
    } catch (error) {
      console.error('Xabar yuborishda xato:', error);
      return { event: 'messageSent', status: 'error' };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    client: Socket,
    payload: { senderId: string; receiverId: string; isTyping: boolean },
  ) {
    this.server.to(payload.receiverId).emit('typing', {
      senderId: payload.senderId,
      isTyping: payload.isTyping,
    });
  }
}
