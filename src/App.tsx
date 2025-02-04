import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import CatalogPage from './pages/student/catalogPage';
import ItemDescription from './pages/student/itemDesc';
import CreateItem from './pages/student/createItem';

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
  const [username, setUsername] = useState('User');

  const menuItems = [
    { label: 'Lost & Found', link: '/itemCatalogPage' },
    { label: 'I found/lost something', link: '/createItem' },
  ];

  const items: MenuProps['items'] = menuItems.map((item) => ({
    key: item.label,
    label: <Link to={item.link} style={{ color: 'black' }}>{item.label}</Link>,
  }));

  const getUserProfilePic = async () => {
    const userId = user?.username;
    const { data } = await client.models.UserProfile.get({ userId }, { authMode: 'userPool' });
    setProfilePic(data?.profilePath || '');
    setUsername(data?.username || 'User');
  };

  useEffect(() => {
    getUserProfilePic();
  }, [profilePic]);

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
          backgroundColor: 'white',
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Link to={"/itemcatalogpage"}>
            <img
              src="https://sgwiki.com/images/thumb/0/01/Nanyang_Polytechnic_Logo.png/300px-Nanyang_Polytechnic_Logo.png"
              style={{ marginLeft: '100px', marginRight: '50px', height: '100%', width: '200px', display:'block' }}
              alt="Logo"
            /> 
          </Link>

          <Menu
            theme="light" // Use "light" theme to avoid dark background
            mode="horizontal"
            defaultSelectedKeys={[]} // No default selected key
            selectedKeys={[]} // No selected key
            items={items}
            style={{
              flex: 1,
              minWidth: 0,
              margin: 0, // Remove margin
              padding: 0, // Remove padding
              backgroundColor: 'white',
              borderBottom: 'none', // Remove border
            }}
          />
        </div>
        <p style={{ fontSize: '14px', marginRight: '15px' }}>Welcome, {username}</p>
        <Dropdown overlay={avatarMenu} placement="bottomRight" trigger={['click']}>
          <StorageImage
            alt={defaultCover}
            path={profilePic || 'uploads/default_user_profile.jpg'}
            style={{
              width: '40px', // Set a small size
              height: '40px', // Ensure height matches width for a perfect circle
              borderRadius: '50%', // Make it circular
              cursor: 'pointer',
              border: '2px solid #ffffff', // Add a border (adjust color and thickness as needed)
              marginRight: 16, // Optional spacing
              objectFit: 'cover', // Ensure the image covers the circle without distortion
              backgroundColor: 'white',
            }}
          />
        </Dropdown>
      </Header>

      <Routes>
        <Route path="/itemCatalogPage" element={<ItemCatalogPage />} />
        <Route path="/catalogPage" element={<CatalogPage />} />
        <Route path="/catalogPage/:id" element={<ItemDescription />} />
        <Route path="/createItem" element={<CreateItem />} />
        <Route path="/profilePage" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;