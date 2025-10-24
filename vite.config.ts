import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: 'content/[name].js',
        chunkFileNames: 'content/[name].js',
        assetFileNames: 'content/[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy manifest.json to dist
        copyFileSync(
          resolve(__dirname, 'src/manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        );

        // Create icons directory
        const iconsSourceDir = resolve(__dirname, 'public/icons');
        const iconsDestDir = resolve(__dirname, 'dist/icons');

        mkdirSync(iconsDestDir, { recursive: true });

        // Copy icon files if they exist
        if (existsSync(iconsSourceDir)) {
          const iconFiles = readdirSync(iconsSourceDir);
          iconFiles.forEach((file) => {
            copyFileSync(
              resolve(iconsSourceDir, file),
              resolve(iconsDestDir, file)
            );
          });
          console.log(`✓ Copied ${iconFiles.length} icon file(s)`);
        } else {
          console.warn('⚠️  No icons found in public/icons. Run "pnpm run generate-icons" first.');
        }
      },
    },
  ],
});
