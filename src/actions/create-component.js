import inquirer from 'inquirer';
import {camelCase} from 'lodash';
import fs from 'fs-extra'
import path from 'path'
const TEMPLATE_FOLDER = '../../templates/template/createComponent';

const createComponent = async () => {
    const {componentName, shouldCreateTalon} = await inquirer.prompt([{
        type: "input",
        name: "componentName",
        message: "Component name [ex: MyAccount]: ",
        validate: (value) => {
            if (value === '') {
                console.log("\n ⛔  Please enter component name :  ");
                return false;
            }
            return true
        }
    },
        {
            type: "confirm",
            name: "shouldCreateTalon",
            message: "Do you want to create talon folder: ",
            default: false
        }
    ])


    const currentFileURL = import.meta.url;
    const templatePath = path.resolve(
       new URL(currentFileURL).pathname,
       TEMPLATE_FOLDER
    )
    const targetPath = `${process.cwd()}/packages/core/src`


    try{
        fs.accessSync(targetPath, fs.constants.X_OK)
    }catch (e) {
        console.warn("⛔ core folder doesn't exist.")
    }

    generateComponent(templatePath, targetPath, componentName, shouldCreateTalon);
}

const generateComponent = async (templatePath, targetFolderPath, componentName, shouldCreateTalon) => {
    let folderGenerates = {
        component: {
            fromPath: `${templatePath}/ComponentName`,
            targetPath: `${targetFolderPath}/components/${componentName}`,
            icon: '💌'
        },
        talon: {
            fromPath: `${templatePath}/TalonName`,
            targetPath: `${targetFolderPath}/talons/${componentName}`,
            icon: '👗'
        }
    }

    if (!shouldCreateTalon) delete folderGenerates.talon

    for (const folderGeneratesKey in folderGenerates) {
       const {fromPath, targetPath, icon} = folderGenerates[folderGeneratesKey];

        const isTargetFolderExist = fs.existsSync(targetPath);

        if (isTargetFolderExist) {
            const {shouldOverride} = await inquirer.prompt({
                type: "confirm",
                name: "shouldOverride",
                message: `${folderGeneratesKey.toUpperCase()} folder is exits. Do you want override it ? `,
                default: false
            })

            if (!shouldOverride) {
                continue;
            }
        }

        fs.copySync(fromPath, targetPath);
        fs.readdirSync(targetPath).forEach(fileName => {
            const currentFilePath = `${targetPath}/${fileName}`;
            // Change content of file
            let oldContent = fs.readFileSync(currentFilePath, 'utf-8');
            const newContent = oldContent
            .replace(/\{tgpwa\_file\_name\}/g, camelCase(componentName))
            .replace(/\{tgpwa\_component\_name\}/g, componentName);
            fs.writeFileSync(currentFilePath, newContent, 'utf-8');

            // Rename file
            const newName = fileName.replace(/\[\.\]/g, '.')
                .replace(/\{fileName\}/g, camelCase(componentName))
                .replace(/\{componentName\}/g, componentName)
            fs.renameSync(currentFilePath, `${targetPath}/${newName}`);
        });
        console.log(`${icon}: ${targetPath}`)
    }
    console.info("\x1b[32m", `\n✅ Create new component successfully !! \n`)

}

export default createComponent;
