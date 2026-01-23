#!/usr/bin/env node

/**
 * Migration script: Remove Context-based useLocale and migrate to Zustand
 *
 * Changes:
 * 1. Replace: import { useLocale } from '@/context/Locale'
 *    With: import i18n from '@/locale/i18n' OR import { useLocaleStore } from '@/stores/localeStore'
 *
 * 2. Replace: const { i18n } = useLocale()
 *    With: import i18n from '@/locale/i18n' at top
 *
 * 3. Replace: const { locale, changeLocale, isLoading } = useLocale()
 *    With: const { locale, changeLocale, isLoading } = useLocaleStore()
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Files to process
const patterns = [
  'app/**/*.{ts,tsx}',
  'components/**/*.{ts,tsx}',
  'hooks/**/*.{ts,tsx}',
];

// Exclusions
const excludePatterns = [
  '**/node_modules/**',
  '**/context/Locale.tsx',
  '**/stores/localeStore.ts',
];

function log(message, force = false) {
  if (VERBOSE || force) {
    console.log(message);
  }
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let changes = [];

  // Check if file uses useLocale from context
  const usesContextLocale = content.includes("from '@/context/Locale'") ||
                             content.includes('from "@/context/Locale"');

  if (!usesContextLocale) {
    return null; // Skip files that don't use context locale
  }

  // Pattern 1: Only uses i18n
  // const { i18n } = useLocale()
  const onlyUsesI18n = /const\s*{\s*i18n\s*}\s*=\s*useLocale\(\)/g.test(content);

  if (onlyUsesI18n) {
    // Remove import from context
    content = content.replace(
      /import\s*{\s*useLocale\s*}\s*from\s*['"]@\/context\/Locale['"]\s*;?\s*\n/g,
      ''
    );

    // Add i18n import if not exists
    if (!content.includes("from '@/locale/i18n'") && !content.includes('from "@/locale/i18n"')) {
      // Find first import statement and add after it
      const importMatch = content.match(/^import\s+.*from\s+['"].*['"]\s*;?\s*$/m);
      if (importMatch) {
        const insertPosition = importMatch.index + importMatch[0].length;
        content = content.slice(0, insertPosition) +
                  "\nimport i18n from '@/locale/i18n';" +
                  content.slice(insertPosition);
      } else {
        // No imports found, add at top
        content = "import i18n from '@/locale/i18n';\n" + content;
      }
    }

    // Remove useLocale() calls
    content = content.replace(/const\s*{\s*i18n\s*}\s*=\s*useLocale\(\)\s*;?\s*/g, '');
    content = content.replace(/const\s*{\s*i18n\s*}\s*=\s*useLocale\(\)\s*;?\s*\/\/[^\n]*\n/g, '');

    changes.push('Migrated to direct i18n import');
  } else {
    // Pattern 2: Uses other locale properties (locale, changeLocale, isLoading)
    // Replace useLocale with useLocaleStore
    content = content.replace(
      /import\s*{\s*useLocale\s*}\s*from\s*['"]@\/context\/Locale['"]\s*;?/g,
      "import { useLocaleStore } from '@/stores/localeStore';"
    );

    content = content.replace(/useLocale\(\)/g, 'useLocaleStore()');

    changes.push('Migrated to useLocaleStore');
  }

  // Clean up any double blank lines
  content = content.replace(/\n\n\n+/g, '\n\n');

  if (content !== originalContent) {
    if (DRY_RUN) {
      log(`[DRY RUN] Would update: ${filePath}`, true);
      log(`  Changes: ${changes.join(', ')}`);
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
      log(`Updated: ${filePath}`, true);
      log(`  Changes: ${changes.join(', ')}`);
    }
    return changes;
  }

  return null;
}

function main() {
  console.log('🔄 Starting locale migration...\n');

  if (DRY_RUN) {
    console.log('⚠️  Running in DRY RUN mode - no files will be modified\n');
  }

  let totalFiles = 0;
  let updatedFiles = 0;

  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: path.join(__dirname, '..'),
      absolute: true,
      ignore: excludePatterns,
    });

    files.forEach(file => {
      totalFiles++;
      const changes = migrateFile(file);
      if (changes) {
        updatedFiles++;
      }
    });
  });

  console.log('\n✅ Migration complete!');
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n📝 Next steps:');
    console.log('   1. Remove context/Locale.tsx');
    console.log('   2. Remove LocaleProvider from app layouts');
    console.log('   3. Test the app');
  }
}

main();
