// sea-windows.js - Windows用SEAビルドスクリプト
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

// SEA設定
const SEA_CONFIG = {
  main: './dist/windows/sea-bundle.js',
  output: './dist/windows/advanced-backlog-mcp.blob',
  executableName: 'advanced-backlog-mcp.exe',
};

// ビルドステップ
async function buildSEAWindows() {
  console.log('🚀 Windows向けSEAビルドを開始します...');
  
  // ディレクトリ作成
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }
  if (!fs.existsSync('./dist/windows')) {
    fs.mkdirSync('./dist/windows', { recursive: true });
  }
  
  // 1. esbuildでアプリケーションをバンドル（CommonJS形式に変換）
  console.log('📦 アプリケーションをバンドルしています...');
  await esbuild.build({
    entryPoints: ['./build/index.js'],
    bundle: true,
    platform: 'node',
    target: 'node16',
    outfile: SEA_CONFIG.main,
    format: 'cjs',
  });
  console.log('✅ バンドル完了');
  
  // 2. SEA設定ファイル生成
  console.log('📝 SEA設定ファイルを生成しています...');
  const seaConfigJSON = {
    main: SEA_CONFIG.main,
    output: SEA_CONFIG.output,
  };
  fs.writeFileSync('./dist/windows/sea-config.json', JSON.stringify(seaConfigJSON, null, 2));
  console.log('✅ SEA設定ファイル生成完了');
  
  // 3. SEAブロブ生成
  console.log('🔧 SEAブロブを生成しています...');
  execSync('node --experimental-sea-config ./dist/windows/sea-config.json', { stdio: 'inherit' });
  console.log('✅ SEAブロブ生成完了');
  
  // 4. Node.jsバイナリをコピー
  console.log('📋 Node.jsバイナリをコピーしています...');
  const destPath = `./dist/windows/${SEA_CONFIG.executableName}`;
  // バックスラッシュをエスケープして、Node.js内で正しく解釈されるようにする
  const normalizedPath = destPath.replace(/\\/g, '\\\\');
  execSync(`node -e "require('fs').copyFileSync(process.execPath, '${normalizedPath}')"`, { stdio: 'inherit' });
  console.log('✅ バイナリコピー完了');
  
  // 5. ブロブを注入
  console.log('💉 SEAブロブを注入しています...');
  // パスを引用符で囲む（スペースがあっても正しく処理されるように）
  execSync(`npx postject "${destPath}" NODE_SEA_BLOB "${SEA_CONFIG.output}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, { stdio: 'inherit' });
  console.log('✅ ブロブ注入完了');
  
  console.log(`🎉 Windows向けSEAビルドが完了しました！ 実行ファイル: ${destPath}`);
}

buildSEAWindows().catch(err => {
  console.error('❌ SEAビルドエラー:', err);
  process.exit(1);
});
