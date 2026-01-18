#!/usr/bin/env node
/**
 * Fix dependency issues for react-native-sqlite-storage
 * This script ensures jcenter() is replaced with mavenCentral()
 * Runs automatically via npm postinstall hook
 */

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(
  __dirname,
  '../node_modules/react-native-sqlite-storage/platforms/android/build.gradle'
);

function fixBuildGradle() {
  try {
    if (!fs.existsSync(buildGradlePath)) {
      console.log('✓ react-native-sqlite-storage build.gradle not found (may be normal)');
      return;
    }

    let content = fs.readFileSync(buildGradlePath, 'utf8');
    const hasJcenter = content.includes('jcenter()');
    
    if (hasJcenter) {
      console.log('🔧 Fixing react-native-sqlite-storage build.gradle: replacing jcenter() with mavenCentral()');
      content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
      fs.writeFileSync(buildGradlePath, content, 'utf8');
      console.log('✅ Fixed react-native-sqlite-storage build.gradle successfully');
    } else {
      console.log('✓ react-native-sqlite-storage build.gradle is already correct (no jcenter() found)');
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not fix build.gradle:', error.message);
    process.exit(0); // Don't fail npm install
  }
}

console.log('[postinstall] Running fix-dependencies script...');
fixBuildGradle();
console.log('[postinstall] Done');

