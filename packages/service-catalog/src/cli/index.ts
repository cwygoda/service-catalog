import { Command } from 'commander';
import { buildCommand } from './commands/build.command.js';
import { lintCommand } from './commands/lint.command.js';

const program = new Command();

program
  .name('service-catalog')
  .description('Build service catalogs from service descriptions')
  .version('0.0.0');

program.addCommand(buildCommand);
program.addCommand(lintCommand);

program.parse();
