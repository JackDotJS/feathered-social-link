import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import memory from './memory.js';
import { BaseCommand } from '../../classes/Command.js';

export async function initializeCommands() {
  if (!memory.log) throw new Error(`memory.log is null!`);
  const log = memory.log;

  const cmdDir = resolve(`${dirname(fileURLToPath(import.meta.url))}../../../commands`);

  if (!existsSync(cmdDir)) {
    throw new Error(`Could not find command directory: ${cmdDir}`);
  }

  for (const item of readdirSync(cmdDir, { withFileTypes: true })) {
    if (item.isDirectory()) continue;

    const module = await import(`${cmdDir}/${item.name}`);
    const command = module.default;

    if ((command instanceof BaseCommand) == false) {
      log.debug(command instanceof BaseCommand, typeof command, command);
      log.warn(`Failed to load command "${item.name}" (Not a valid command)`);
      continue;
    }

    if (command.metadata == null) {
      log.debug(command);
      log.warn(`Failed to load command "${item.name}" (Missing metadata)`);
      continue;
    }

    if (command.discordHandler == null) {
      log.info(`Failed to load command "${item.name}" (Not executable in Discord context)`);
      continue;
    }

    memory.commands.push(command);
    log.info(`Successfully loaded command "${item.name}"`);
  }

  log.debug(memory.commands);
  return;
}