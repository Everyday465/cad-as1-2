import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import CatalogPage from './pages/student/catalogPage';
import ItemDescription from './pages/student/itemDesc';
import CreateItem from './pages/student/createItem';
import Test from './pages/test';

//admin
import ItemCatalogPage from './pages/admin/itemCatalogPage';
import ProfilePage from './pages/userManagement/profilePage';

import { Layout, Menu, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
const { Header } = Layout;

import { useAuthenticator } from '@aws-amplify/ui-react';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../cad-as1-2/amplify/data/resource';
import { useEffect, useState } from 'react';
import { StorageImage } from '@aws-amplify/ui-react-storage';

const client = generateClient<Schema>();

const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';

const App = () => {

  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [profilePic, setProfilePic] = useState('');

  const menuItems = [
    { label: 'Lost & Found', link: '/itemCatalogPage' },
    { label: 'I found/lost something', link: '/createItem' },
    { label: 'Check Database', link: '/i-lost-something' },
  ];

  const items: MenuProps['items'] = menuItems.map((item) => ({
    key: item.label,
    label: <Link to={item.link}>{item.label}</Link>,
  }));

  const getUserProfilePic = async () => {
    const userId = user?.username
    const { data } = await client.models.UserProfile.get({ userId }, { authMode: 'userPool' });
    setProfilePic(data?.profilePath || '')
  }

  useEffect(() => {
    getUserProfilePic()
  }, [profilePic])


  const avatarMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: <Link to="/profilePage">Profile</Link>,
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
          <StorageImage
            alt={defaultCover}
            path={profilePic || 'uploads/1735195523776_bell__notification.jpg'}
            style={{
              width: '40px', // Set a small size
              height: '40px', // Ensure height matches width for a perfect circle
              borderRadius: '50%', // Make it circular
              cursor: 'pointer',
              border: '2px solid #ffffff', // Add a border (adjust color and thickness as needed)
              marginRight: 16, // Optional spacing
              objectFit: 'cover', // Ensure the image covers the circle without distortion
            }}
          />
        </Dropdown>
      </Header>

      <Routes>
        <Route path="/itemCatalogPage" element={<ItemCatalogPage />} />
        <Route path="/catalogPage" element={<CatalogPage />} />
        <Route path="/catalogPage/:id" element={<ItemDescription />} />
        <Route path="/createItem" element={<CreateItem />} />
        <Route path="/test" element={<Test />} />
        <Route path="/profilePage" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
