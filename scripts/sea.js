// sea-config.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

// SEA設定
const SEA_CONFIG = {
  main: './dist/sea-bundle.js',  // バンドル後のエントリーポイント
  output: './dist/backlog-sea.blob',  // 生成されるSEAブロブ
  executableName: 'backlog-sea',  // 生成される実行ファイル名
};

// ビルドステップ
async function buildSEA() {
  console.log('🚀 SEAビルドを開始します...');
  
  // ディレクトリ作成
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
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
  fs.writeFileSync('./dist/sea-config.json', JSON.stringify(seaConfigJSON, null, 2));
  console.log('✅ SEA設定ファイル生成完了');
  
  // 3. SEAブロブ生成
  console.log('🔧 SEAブロブを生成しています...');
  execSync('node --experimental-sea-config ./dist/sea-config.json', { stdio: 'inherit' });
  console.log('✅ SEAブロブ生成完了');
  
  // 4. Node.jsバイナリをコピー
  console.log('📋 Node.jsバイナリをコピーしています...');
  const isWindows = process.platform === 'win32';
  const exeExtension = isWindows ? '.exe' : '';
  const destPath = `./dist/${SEA_CONFIG.executableName}${exeExtension}`;
  
  if (isWindows) {
    execSync(`node -e "require('fs').copyFileSync(process.execPath, '${destPath}')"`, { stdio: 'inherit' });
  } else {
    execSync(`cp $(command -v node) ${destPath}`, { stdio: 'inherit' });
  }
  console.log('✅ バイナリコピー完了');
  
  // 5. 署名を削除（macOSとWindowsのみ）
  if (process.platform === 'darwin') {
    console.log('🔑 macOSバイナリの署名を削除しています...');
    execSync(`codesign --remove-signature ${destPath}`, { stdio: 'inherit' });
    console.log('✅ 署名削除完了');
  } else if (isWindows) {
    console.log('🔑 Windowsでの署名削除はオプションです（signtoolが必要）');
    // signtoolが利用可能な場合はコメントを外す
    // execSync(`signtool remove /s ${destPath}`, { stdio: 'inherit' });
  }
  
  // 6. ブロブを注入
  console.log('💉 SEAブロブを注入しています...');
  const postjectCmd = isWindows 
    ? `npx postject ${destPath} NODE_SEA_BLOB ${SEA_CONFIG.output} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`
    : process.platform === 'darwin'
      ? `npx postject ${destPath} NODE_SEA_BLOB ${SEA_CONFIG.output} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA`
      : `npx postject ${destPath} NODE_SEA_BLOB ${SEA_CONFIG.output} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`;
  
  execSync(postjectCmd, { stdio: 'inherit' });
  console.log('✅ ブロブ注入完了');
  
  // 7. 再署名（macOSとWindowsのみ）
  if (process.platform === 'darwin') {
    console.log('🔑 macOSバイナリに再署名しています...');
    execSync(`codesign --sign - ${destPath}`, { stdio: 'inherit' });
    console.log('✅ 再署名完了');
  } else if (isWindows) {
    console.log('🔑 Windowsでの署名はオプションです（signtoolが必要）');
    // signtoolが利用可能な場合はコメントを外す
    // execSync(`signtool sign /fd SHA256 ${destPath}`, { stdio: 'inherit' });
  }
  
  // 8. 実行権限を付与
  if (!isWindows) {
    console.log('🔒 実行権限を付与しています...');
    execSync(`chmod +x ${destPath}`, { stdio: 'inherit' });
    console.log('✅ 権限設定完了');
  }
  
  console.log(`🎉 SEAビルドが完了しました！ 実行ファイル: ${destPath}`);
}

buildSEA().catch(err => {
  console.error('❌ SEAビルドエラー:', err);
  process.exit(1);
});