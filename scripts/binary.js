#!/usr/bin/env node

import { exec as execRegular } from 'child_process';
import fs, { promises as fsPromises } from 'fs';
import got from 'got';
import path from 'path';
import stream from 'stream';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exec = promisify(execRegular);
const pipeline = promisify(stream.pipeline);

const SupportedArch = ['darwin-arm64', 'darwin-x64', 'linux-x64'];

async function install() {
  const target = `${process.platform}-${process.arch}`;

  if (!SupportedArch.includes(target)) {
    console.error(`${target} - this architecture is not supported`);
    return;
  }

  const binaryDir = path.join(__dirname, '..', 'vendor');
  await fsPromises.mkdir(binaryDir, { recursive: true });

  const url = `https://binary.saleor.live/tunnel-${process.platform}-${process.arch}`;

  const downloadStream = got.stream(url);
  const fileWriterStream = fs.createWriteStream(
    path.join(binaryDir, 'tunnel'),
    { mode: 0o755 }
  );

  // FIXME progress bar not working
  // const bar = new progress.SingleBar({}, progress.Presets.shades_classic);
  // bar.start(100, 0);
  // downloadStream.on("downloadProgress", ({ percent }) => {
  //   const percentage = Math.round(percent * 100);
  //   bar.update(percentage, { filename: 'asdf.js'})
  // });
  // bar.stop();

  try {
    await pipeline(downloadStream, fileWriterStream);
  } catch (error) {
    console.error(`Something went wrong. ${error}`);
  }

  const { stdout } = await exec('./vendor/tunnel --version');
  if (stdout.length > 0) {
    console.log('Saleor binaries correctly installed.');
  }
}

async function uninstall() {
  //
}

const actions = { install, uninstall };

const main = async () => {
  const { argv } = process;
  if (argv.length > 2) {
    const cmd = process.argv[2];

    await actions[cmd]();
  }
};

main();
