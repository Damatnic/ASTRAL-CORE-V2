import winston from 'winston';

declare module 'winston' {
  interface Logger {
    critical(message: string, meta?: any): Logger;
  }
}
