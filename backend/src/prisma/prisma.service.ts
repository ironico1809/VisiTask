import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    this.$connect()
      .then(() => {
        this.logger.log('Connected to PostgreSQL database successfully');
      })
      .catch((error: any) => {
        this.logger.warn(`Database connection deferred or offline: ${error?.message}`);
      });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
