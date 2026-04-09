import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { Sidebar } from '../components/Sidebar';

const { Sider, Content } = Layout;

export default function MainPage() {
  return (
    <Layout className="app-layout">
      <Sider width={260} className="app-sider" theme="dark">
        <Sidebar />
      </Sider>
      <Layout className="app-content">
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
