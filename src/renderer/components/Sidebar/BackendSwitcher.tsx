import { Select } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { BackendProvider, BackendProviderDisplayNames, BackendProviderColors } from '@shared/types';
import { useSettingsStore } from '../../stores/settingsStore';

export default function BackendSwitcher() {
  const { currentBackend, setCurrentBackend, tokens } = useSettingsStore();

  const options = Object.values(BackendProvider).map((provider) => {
    const color = BackendProviderColors[provider];
    const isConfigured = !!tokens[provider];

    return {
      value: provider,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, fontSize: 12 }}>{BackendProviderDisplayNames[provider]}</span>
          {isConfigured ? (
            <CheckCircleFilled style={{ color: '#52c41a', fontSize: 11 }} />
          ) : (
            <ExclamationCircleFilled style={{ color: '#faad14', fontSize: 11 }} />
          )}
        </div>
      ),
    };
  });

  return (
    <Select
      value={currentBackend}
      onChange={(value) => setCurrentBackend(value as BackendProvider)}
      options={options}
      style={{ width: '100%' }}
      popupMatchSelectWidth={180}
      size="small"
    />
  );
}
