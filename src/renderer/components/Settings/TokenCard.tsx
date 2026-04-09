import { useState } from 'react';
import { BackendProvider, BackendProviderDisplayNames, BackendProviderColors } from '@shared/types';
import { useSettingsStore } from '../../stores/settingsStore';

interface TokenCardProps {
  provider: BackendProvider;
}

export default function TokenCard({ provider }: TokenCardProps) {
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const { tokens, setToken: saveToken } = useSettingsStore();

  const currentToken = tokens[provider];
  const hasToken = !!currentToken;
  const color = BackendProviderColors[provider];

  const handleSave = async () => {
    if (!token.trim()) return;
    setSaving(true);
    try {
      await saveToken(provider, token.trim());
      setToken('');
    } finally {
      setSaving(false);
    }
  };

  const getInstructions = () => {
    switch (provider) {
      case BackendProvider.Kimi:
        return '在 Kimi 网页中打开开发者工具 (F12)，找到 Application > Local Storage，复制 Authorization 值';
      case BackendProvider.DeepSeek:
        return '前往 DeepSeek 开放平台获取 API Key: https://platform.deepseek.com/api_keys';
      case BackendProvider.Doubao:
        return '在火山引擎控制台获取 Doubao API Key';
      case BackendProvider.Qianwen:
        return '在阿里云百炼平台获取通义千问 API Key: https://bailian.console.aliyun.com';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: color }}
          >
            {provider === BackendProvider.Kimi && 'K'}
            {provider === BackendProvider.DeepSeek && 'DS'}
            {provider === BackendProvider.Doubao && 'D'}
            {provider === BackendProvider.Qianwen && 'Q'}
          </div>
          <span className="font-medium text-gray-800">
            {BackendProviderDisplayNames[provider]}
          </span>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            hasToken ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}
        >
          {hasToken ? '已配置' : '未配置'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={hasToken ? '已保存，新token覆盖旧token' : '输入 API Token'}
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            {showToken ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={!token.trim() || saving}
          className="w-full py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存 Token'}
        </button>

        <p className="text-xs text-gray-500 leading-relaxed">
          {getInstructions()}
        </p>
      </div>
    </div>
  );
}
