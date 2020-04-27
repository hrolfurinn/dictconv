const path = require('path');
const fs = require('fs');
const yargRoot = require('yargs');
const { execSync } = require('child_process');
const { fromArchive, fromIfo } = require('./lib/raw');
const { buildDictionary } = require('./lib/build');

module.exports = yargRoot
  .command('raw <stardict> <destPath>', 'Convert the startdict to xml dictionary.',
    (yargs) => {
      yargs
        .positional('stardict', {
          describe: '<stardict> The path to the stardict file.',
          type: 'string',
        })
        .positional('destPath', {
          describe: '<destPath> The destination path.',
          type: 'string',
        });
    },
    (argv) => {
      if (path.extname(argv.stardict) === '.ifo') {
        fromIfo(argv.stardict, argv.destPath);
      } else {
        fromArchive(argv.stardict, argv.destPath);
      }
    })
  .command('build <rawPath> [<destPath>]', 'Build the Mac dictionary from raw data',
    (yargs) => {
      yargs
        .positional('rawPath', {
          describe: '<rawPath> The path to the raw data files.',
          type: 'string',
        })
        .option('name', {
          alias: 'n',
          describe: 'The name of dictionary',
          type: 'string',
        })
        .option('install', {
          alias: 'i',
          describe: 'Install the converted dictionary to the system',
          default: false,
          type: 'boolean',
        })
        .option('verbose', {
          alias: 'v',
          describe: 'Print all logs',
          default: false,
          type: 'boolean',
        });
    },
    async (argv) => {
      if (!argv.install && !argv.destPath) {
        console.error('Please provide destination path or --install.');
        return;
      }
      const name = argv.name || argv.rawPath.split(path.sep).slice(-1).pop();
      const xmlFile = path.resolve(argv.rawPath, 'Dictionary.xml');
      const cssFile = path.resolve(argv.rawPath, 'Dictionary.css');
      const plistFile = path.resolve(argv.rawPath, 'DictInfo.plist');
      if (!fs.existsSync(xmlFile)) {
        console.error(`${xmlFile} not found.`);
        return;
      }
      if (!fs.existsSync(cssFile)) {
        console.error(`${cssFile} not found.`);
        return;
      }
      if (!fs.existsSync(plistFile)) {
        console.error(`${plistFile} not found.`);
        return;
      }
      const dict = await buildDictionary(name, xmlFile, cssFile, plistFile, {
        destPath: argv.destPath,
        verbose: argv.verbose,
      });
      if (argv.install) {
        execSync(`cp -r ${dict} ~/Library/Dictionaries/`);
      }
    })
  .command('convert <stardict> [<destPath>]', 'Convert the startdict to Mac dictionary.',
    (yargs) => {
      yargs
        .positional('stardict', {
          describe: '<stardict> The path to the stardict file.',
          type: 'string',
        })
        .positional('destPath', {
          describe: '<destPath> The destination path.',
          type: 'string',
        })
        .option('install', {
          alias: 'i',
          describe: 'Install the converted dictionary to the system',
          default: false,
          type: 'boolean',
        });
    },
    async (argv) => {
      if (!argv.install && !argv.destPath) {
        console.error('Please provide destination path or --install.');
        return;
      }
      console.log(argv);
    })
  .help()
  .alias('h', 'help')
  .parse;
