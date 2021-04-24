import { container } from 'tsyringe';
import { token } from 'domain/service/LoggerService';
import logger from './logger';

container.registerInstance(token, logger);
export default logger;
