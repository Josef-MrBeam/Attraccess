import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';
// import { applicationGenerator } from '@nx/nest';
import { apiModuleGeneratorGenerator } from './api-module.generator';

// Mock the @nx/nest generators
jest.mock('@nx/nest', () => {
  return {
    moduleGenerator: jest.fn().mockImplementation((tree, options) => {
      const path = options.path;
      const parts = path.split('/');
      const name = parts[parts.length - 1].replace('.module.ts', '');
      const className = name.charAt(0).toUpperCase() + name.slice(1);

      // Create the directory structure
      const dirPath = path.substring(0, path.lastIndexOf('/'));
      if (!tree.exists(dirPath)) {
        tree.write(`${dirPath}/.gitkeep`, '');
      }

      // Write the module file
      tree.write(
        path,
        `import { Module } from '@nestjs/common';

@Module({})
export class ${className}Module {}`
      );

      return Promise.resolve();
    }),

    serviceGenerator: jest.fn().mockImplementation((tree, options) => {
      const path = options.path;
      const parts = path.split('/');
      const name = parts[parts.length - 1].replace('.service.ts', '');
      const className = name.charAt(0).toUpperCase() + name.slice(1);

      // Write the service file
      tree.write(
        path,
        `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${className}Service {}`
      );

      return Promise.resolve();
    }),

    controllerGenerator: jest.fn().mockImplementation((tree, options) => {
      const path = options.path;
      const parts = path.split('/');
      const name = parts[parts.length - 1].replace('.controller.ts', '');
      const className = name.charAt(0).toUpperCase() + name.slice(1);

      // Write the controller file
      tree.write(
        path,
        `import { Controller } from '@nestjs/common';

@Controller('${name}')
export class ${className}Controller {}`
      );

      return Promise.resolve();
    }),
  };
});

// Helper function to generate all possible combinations of boolean options
function generateOptionPermutations(
  optionNames: string[]
): Array<Record<string, boolean>> {
  const permutations: Array<Record<string, boolean>> = [];
  const totalCombinations = Math.pow(2, optionNames.length);

  for (let i = 0; i < totalCombinations; i++) {
    const combination: Record<string, boolean> = {};
    optionNames.forEach((name, index) => {
      combination[name] = !!(i & (1 << index));
    });
    permutations.push(combination);
  }

  return permutations;
}

describe('nest-module-generator generator', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    /*await applicationGenerator(tree, {
      name: 'api',
      directory: 'apps',
    });*/

    // Ensure the 'apps/api/src' directory exists in the tree
    tree.write('apps/api/src/.gitkeep', '');
  });

  // Clean up after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Clean up after all tests
  afterAll(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  test.each(generateOptionPermutations(['createService', 'createController']))(
    'should create module with correct files',
    async ({ createService, createController }) => {
      await apiModuleGeneratorGenerator(tree, {
        name: 'test',
        createService,
        createController,
      });

      expect(tree.exists(`apps/api/src/test/test.module.ts`)).toBe(true);
      expect(tree.exists(`apps/api/src/test/test.service.ts`)).toBe(
        createService
      );
      expect(tree.exists(`apps/api/src/test/test.controller.ts`)).toBe(
        createController
      );
    }
  );
});
