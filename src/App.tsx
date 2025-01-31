import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import CatalogPage from './pages/student/catalogPage';
import ItemDescription from './pages/student/itemDesc';
import CreateItem from './pages/student/createItem';
import Test from './pages/test';

//admin
import ItemCatalogPage from './pages/admin/itemCatalogPage';

import { Avatar, Layout, Menu, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
const { Header } = Layout;

import { useAuthenticator } from '@aws-amplify/ui-react';

const App = () => {

  const { signOut } = useAuthenticator();

  const menuItems = [
    { label: 'Lost & Found', link: '/itemCatalogPage' },
    { label: 'I found/lost something', link: '/createItem' },
    { label: 'Check Database', link: '/i-lost-something' },
  ];

  const items: MenuProps['items'] = menuItems.map((item) => ({
    key: item.label,
    label: <Link to={item.link}>{item.label}</Link>,
  }));


  const avatarMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: <Link to="/profile">Profile</Link>,
        },
        {
          key: '2',
          label: <Link to="/settings">Settings</Link>,
        },
        {
          key: '3',
          label: <button onClick={signOut}>Sign out</button>,
        },
      ]}
    />

  );
  return (
    <Router>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: 0, // Remove default padding
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={items}
            style={{
              flex: 1,
              minWidth: 0,
              margin: 0, // Remove margin
              padding: 0, // Remove padding
            }}
          />
        </div>
        <Dropdown overlay={avatarMenu} placement="bottomRight" trigger={['click']}>
          <Avatar
            style={{
              cursor: 'pointer',
              marginRight: 16, // Optional spacing if needed
            }}
            src="https://api.dicebear.com/7.x/miniavs/svg?seed=avatar"
            alt="User Avatar"
          />
        </Dropdown>
      </Header>

      <Routes>
        <Route path="/itemCatalogPage" element={<ItemCatalogPage/>} />
        <Route path="/catalogPage" element={<CatalogPage />} />
        <Route path="/catalogPage/:id" element={<ItemDescription />} />
        <Route path="/createItem" element={<CreateItem />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
};

export default App;
