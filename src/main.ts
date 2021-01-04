import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server');
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || serverConfig.port

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({
      origin: serverConfig.origin
    })

    logger.log(`Accepting request from origin ${serverConfig.origin}`)
  }

  await app.listen(port);

  logger.log(`App listening on port ${port}`)
}
bootstrap();
