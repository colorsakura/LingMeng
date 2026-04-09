import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6e8cba',
          colorBgContainer: '#252526',
          colorBgElevated: '#2d2d2d',
          colorBgLayout: '#1e1e1e',
          colorBgSpotlight: '#2d2d2d',
          colorText: '#cdd9e5',
          colorTextSecondary: '#9d9d9f',
          colorTextTertiary: '#6b6b6b',
          colorBorder: '#37373a',
          borderRadius: 6,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        components: {
          Button: {
            defaultBg: '#252526',
            defaultBorderColor: '#37373a',
            defaultColor: '#9d9d9f',
          },
          Input: {
            colorBgContainer: '#2d2d2d',
            colorBorder: '#37373a',
            activeBorderColor: '#6e8cba',
            hoverBorderColor: '#6e8cba',
          },
          Select: {
            colorBgContainer: '#2d2d2d',
            colorBgElevated: '#2d2d2d',
            colorBorder: '#37373a',
            optionSelectedBg: 'rgba(110,140,186,0.15)',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemHoverBg: '#2d2d2d',
            darkItemSelectedBg: 'rgba(110,140,186,0.15)',
            darkItemColor: '#9d9d9f',
            darkItemHoverColor: '#cdd9e5',
            darkItemSelectedColor: '#cdd9e5',
          },
          Card: {
            colorBgContainer: '#252526',
            colorBorderSecondary: '#37373a',
          },
          Alert: {
            colorBgContainer: '#252526',
            colorBorder: '#37373a',
          },
          Tag: {
            colorBgContainer: '#2d2d2d',
            colorBorder: '#37373a',
          },
          Popconfirm: {
            colorBgElevated: '#252526',
          },
          List: {
            colorBgContainer: 'transparent',
            colorBorderSecondary: 'transparent',
          },
          Empty: {
            colorTextDescription: '#6b6b6b',
          },
          Spin: {
            colorPrimary: '#6e8cba',
          },
          Tooltip: {
            colorBgSpotlight: '#2d2d2d',
          },
          Popover: {
            colorBgElevated: '#252526',
          },
          Divider: {
            colorSplit: '#37373a',
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
