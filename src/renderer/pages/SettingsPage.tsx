import { useNavigate } from 'react-router-dom';
import { BackendProvider } from '@shared/types';
import { TokenCard } from '../components/Settings';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">设置</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h2 className="text-base font-medium text-gray-800 mb-1">API Token 配置</h2>
          <p className="text-sm text-gray-500">
            配置各 AI 后端的 API Token，每个后端可独立配置
          </p>
        </div>

        <div className="space-y-4">
          <TokenCard provider={BackendProvider.Kimi} />
          <TokenCard provider={BackendProvider.DeepSeek} />
          <TokenCard provider={BackendProvider.Doubao} />
          <TokenCard provider={BackendProvider.Qianwen} />
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">关于 Token 安全</h3>
              <p className="text-xs text-blue-600 mt-1">
                您的 API Token 仅存储在本地，不会发送到任何第三方服务器。请勿将 Token 泄露给他人。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
