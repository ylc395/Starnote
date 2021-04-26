import { container } from 'tsyringe';
import { GIT_TOKEN } from 'domain/service/RevisionService';
import Git from './git';

container.registerSingleton(GIT_TOKEN, Git);
