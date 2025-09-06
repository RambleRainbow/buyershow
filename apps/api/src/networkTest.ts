import { config } from './config/index.js';

async function testNetworkConnections() {
  console.log('🔍 开始网络连接诊断...\n');

  // 测试基本网络连接
  console.log('1. 测试基本网络连接...');
  try {
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(10000)
    });
    console.log(`✅ Google.com 连接成功 (状态码: ${response.status})`);
  } catch (error) {
    console.log(`❌ Google.com 连接失败: ${error.message}`);
  }

  // 测试Google Gemini API端点
  console.log('\n2. 测试Google Gemini API端点...');
  try {
    const testUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    const response = await fetch(testUrl, { 
      method: 'GET',
      headers: {
        'x-goog-api-key': config.nanoBanana.apiKey
      },
      signal: AbortSignal.timeout(10000)
    });
    console.log(`✅ Gemini API端点连接成功 (状态码: ${response.status})`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 可用模型:', data.models?.slice(0, 3).map(m => m.name) || '无法获取');
    } else {
      const errorText = await response.text();
      console.log('❌ API响应错误:', errorText.substring(0, 200));
    }
  } catch (error) {
    console.log(`❌ Gemini API端点连接失败: ${error.message}`);
  }

  // 测试代理服务器
  if (config.nanoBanana.proxyUrl) {
    console.log('\n3. 测试代理服务器连接...');
    try {
      const proxyTest = await fetch(config.nanoBanana.proxyUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      console.log(`✅ 代理服务器响应 (状态码: ${proxyTest.status})`);
    } catch (error) {
      console.log(`❌ 代理服务器连接失败: ${error.message}`);
      console.log('💡 提示: 确保在 localhost:1087 运行代理服务器');
    }
  }

  // 检查API密钥格式
  console.log('\n4. 检查API密钥格式...');
  const apiKey = config.nanoBanana.apiKey;
  if (apiKey.startsWith('AIza') && apiKey.length === 39) {
    console.log('✅ API密钥格式正确');
  } else {
    console.log('❌ API密钥格式可能有问题');
    console.log(`   长度: ${apiKey.length} (应为39)`);
    console.log(`   前缀: ${apiKey.substring(0, 4)} (应为AIza)`);
  }

  console.log('\n🔍 网络诊断完成');
}

testNetworkConnections().catch(console.error);