# Contributing to rapid-sdk

## Contributing Code

Before performing any code changes go through the following setup:

```bash
git checkout main
git pull origin
npm install            # update monorepo root and subpackage dependencies
npm run all            # build everything
```


### Writting code documentation
Code follows [tsdoc](https://tsdoc.org/) standard of commenting and uses [typedoc](https://typedoc.org/) generator to craft HTML documentation.
In order to make comments compact, consistent and still keep neccessary information, the following guidelines should be respected:

Please **avoid**:
- Using jsdoc specific keys such as: @type, @interface, @class... Reasoning: Majority of these are redundant as needed information is inherited from declaration.
- Using {} to specify the type. e.g. @param {number} param1. Reasoning: Redundant as type is inherited from declaration

Please **do**:
- Provide brief explanation of module in file that is target of `typedocMain`
- Use plain comment text to provide core information and @description to provide additional information about a class, method etc.
- Use the following syntax for adding an example of usage:

        @example ```
        new Extent([0, 0], [5, 10]).area();  // returns 50     
        ```

- Use the following syntax for providing one-liner brief descriptions:

        /** distance from point to path */
        distance: number;
        
As a rule of thumb example, please look into math package.

### Using workspace dependencies

If working inside workspaceA and you need a requirement from workspaceB perform the following:
Insde workspaceA/src/?.ts put following line:
import { ... } from '@rapid-sdk/workspaceB';

In order for IDE (VSCode) to perform autocomplete/navigation features on such dependencies make sure of the following:
1) workspaceB is inside the root/node_modules/@rapid-sdk folder
2) workspaceB is freshly built (workspaceB/built/ folder should contain appropriate js, .d.ts translation files)
-  This is achieved by running from the root 'npm run all' command or by building just the workspace you require.

VSCode - If after these steps IDE still reports the error: Cannot find module '@rapid-sdk/workspaceB' or its corresponding type declarations...
Try to remove and then add that line of code (import...).
