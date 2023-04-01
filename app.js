#! /usr/bin/env node

const inquirer = require('inquirer');
const { exec } = require('child_process');
const chalk = require('chalk');
console.clear();
console.log(chalk.red(`
*************************
         BRANCH
        COMMANDER
*************************
`))
function getBranches() {
    return new Promise((resolve, reject) => {
        try {
            exec(`
                git branch -r --format "%(refname:lstrip=-1)-%(creatordate:relative)" | 
                grep -v "main\\|HEAD\\|develop"
            `, (err, stdout) => {
                const data = stdout.split('\n').reduce((acc, cur) => {
                    if (!cur[0]) return acc;
                    const [value] = cur.split('-');
                    return acc = [...acc, { name: cur, value }]
                }, []);
                resolve(data);
            });
        } catch (error) {
            reject([])
        }
    })
}

(async () => {
    const branches = await getBranches();
    if (!branches.length) {
        console.log('No hay ramas que no sean HEAD, main o develop');
        return;
    }
    const { checkBranches } = await inquirer
        .prompt([{
            type: 'checkbox',
            name: 'checkBranches',
            choices: branches,
            message: 'Selecciona las ramas que deseas borrar:',
            askAnswered: false
        }])
    console.clear();
    console.log('Ramas seleccionadas:');
    checkBranches.forEach(elem => {
        console.log(` - ${elem}`);
    });
    const { confirm } = await inquirer
        .prompt([{
            name: 'confirm',
            type: 'confirm',
            message: 'Confirmas eliminación: ',
            default: false
        }]);
    if (confirm) {
        let command = 'git push origin --delete';
        checkBranches.forEach(elem => {
            command += ` ${elem}`;
        })
        console.log(command);
        exec(command, (error) => {
            if (!error) {
                console.log('Se han borrado todas las ramas');
            } else {
                console.log('Ups...');
                console.log({ error });
            }
        })
    }
})()