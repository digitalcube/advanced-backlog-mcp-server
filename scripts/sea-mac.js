// sea-mac.js - macOS用SEAビルドスクリプト
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

// SEA設定
const SEA_CONFIG = {
  main: './dist/macos/sea-bundle.js',
  output: './dist/macos/advanced-backlog-mcp.blob',
  executableName: 'advanced-backlog-mcp',
};

// ビルドステップ
async function buildSEAMac() {
  console.log('🚀 macOS向けSEAビルドを開始します...');
  
  // ディレクトリ作成
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }
  if (!fs.existsSync('./dist/macos')) {
    fs.mkdirSync('./dist/macos', { recursive: true });
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
  fs.writeFileSync('./dist/macos/sea-config.json', JSON.stringify(seaConfigJSON, null, 2));
  console.log('✅ SEA設定ファイル生成完了');
  
  // 3. SEAブロブ生成
  console.log('🔧 SEAブロブを生成しています...');
  execSync('node --experimental-sea-config ./dist/macos/sea-config.json', { stdio: 'inherit' });
  console.log('✅ SEAブロブ生成完了');
  
  // 4. Node.jsバイナリをコピー
  console.log('📋 Node.jsバイナリをコピーしています...');
  const destPath = `./dist/macos/${SEA_CONFIG.executableName}`;
  execSync(`cp $(command -v node) ${destPath}`, { stdio: 'inherit' });
  console.log('✅ バイナリコピー完了');
  
  // 5. 署名を削除
  console.log('🔑 バイナリの署名を削除しています...');
  execSync(`codesign --remove-signature ${destPath}`, { stdio: 'inherit' });
  console.log('✅ 署名削除完了');
  
  // 6. ブロブを注入
  console.log('💉 SEAブロブを注入しています...');
  execSync(`npx postject ${destPath} NODE_SEA_BLOB ${SEA_CONFIG.output} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA`, { stdio: 'inherit' });
  console.log('✅ ブロブ注入完了');
  
  // 7. 再署名
  console.log('🔑 バイナリに再署名しています...');
  execSync(`codesign --sign - ${destPath}`, { stdio: 'inherit' });
  console.log('✅ 再署名完了');
  
  // 8. 実行権限を付与
  console.log('🔒 実行権限を付与しています...');
  execSync(`chmod +x ${destPath}`, { stdio: 'inherit' });
  console.log('✅ 権限設定完了');
  
  console.log(`🎉 macOS向けSEAビルドが完了しました！ 実行ファイル: ${destPath}`);
}

buildSEAMac().catch(err => {
  console.error('❌ SEAビルドエラー:', err);
  process.exit(1);
});
