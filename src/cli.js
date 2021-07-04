import arg from 'arg'

// Template
import welcomeTemplate from './templates/welcome.template'

// Actions

import createComponent from './actions/create-component';

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
        {
            '--git': Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '-g': '--git',
            '-y': '--yes',
            '-i': '--install',
        },
        {
            argv: rawArgs.slice(2),
        }
    );

    return {
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        runInstall: args['--install'] || false
    }
}

export function cli(args) {
   let options = parseArgumentsIntoOptions(args);
   switch (options.template) {
       case 'create-component':
            createComponent();
           break;
       default:
           console.log(welcomeTemplate);
   }
}
