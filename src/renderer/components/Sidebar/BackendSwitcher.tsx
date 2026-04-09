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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: color,
              display: 'inline-block',
              boxShadow: `0 0 6px ${color}`,
            }}
          />
          <span style={{ flex: 1 }}>{BackendProviderDisplayNames[provider]}</span>
          {isConfigured ? (
            <CheckCircleFilled style={{ color: '#52c41a', fontSize: 14 }} />
          ) : (
            <ExclamationCircleFilled style={{ color: '#faad14', fontSize: 14 }} />
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
      popupMatchSelectWidth={200}
    />
  );
}
