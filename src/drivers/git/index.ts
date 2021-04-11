import { container } from 'tsyringe';
import { GIT_TOKEN } from 'domain/service/RevisionService';
import { FsGit } from './FsGit';

container.registerSingleton(GIT_TOKEN, FsGit);
