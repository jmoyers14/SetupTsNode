#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

function setupProject(projectName) {
  const projectPath = path.join(process.cwd(), projectName);
  if (existsSync(projectPath)) {
    console.error(`Directory ${projectName} already exists.`);
    process.exit(1);
  }

  // Step 1: Create a directory for the project
  mkdirSync(projectPath);

  // Step 2: Initialize the project using Yarn
  console.log(`Initializing yarn project in ${projectPath}`);
  execSync('yarn init -y', { cwd: projectPath, stdio: 'inherit' });

  // Step 3: Install dev dependencies
  console.log('Installing dev dependencies: @esbuild-kit/esm-loader, typescript');
  execSync('yarn add -D @esbuild-kit/esm-loader typescript @types/node', { cwd: projectPath, stdio: 'inherit' });

  // Step 4: Add .gitignore
  const gitignoreContent = `node_modules`;
  writeFileSync(path.join(projectPath, '.gitignore'), gitignoreContent);
  console.log('Created .gitignore to exclude node_modules');

  // Step 5: Modify package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = JSON.parse(execSync(`cat ${packageJsonPath}`, { cwd: projectPath }).toString());
  
  // Update package.json configurations
  packageJson.type = 'module';
  packageJson.scripts = {
    ...packageJson.scripts,
    "go": "NODE_NO_WARNINGS=1 node --loader @esbuild-kit/esm-loader"
  };

  // Write the updated package.json
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with type "module" and "go" script.');

  console.log(`Project ${projectName} setup complete.`);
}

// Main script logic
const projectName = process.argv[2];
if (!projectName) {
  console.error('Please provide a project name.');
  process.exit(1);
}

setupProject(projectName);
