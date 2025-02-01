import { StorageImage } from '@aws-amplify/ui-react-storage';
import { Card, Descriptions, Divider, Layout, Breadcrumb, theme, Dropdown, Button, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { fetchUserAttributes, FetchUserAttributesOutput } from 'aws-amplify/auth'; // Import FetchUserAttributesOutput
import UpdateProfileModal from './updateProfile';

const { Content, Footer } = Layout;

const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [userAttributes, setUserAttributes] = useState<FetchUserAttributesOutput | null>(null); // Properly type the state
    const [updateProfileModalVisible, setUpdateProfileModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

    const dropdownItems = [
        {
            key: '1',
            label: <span onClick={() => setUpdateProfileModalVisible(true)}>Update Profile</span>,
        },
        {
            key: '2',
            label: <span onClick={() => setChangePasswordModalVisible(true)}>Change Password</span>,
            danger: true,
        },
    ];

    // Fetch user attributes when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const attributes = await fetchUserAttributes();
                setUserAttributes(attributes); // Set the fetched attributes to state
            } catch (error) {
                console.error('Error fetching user attributes:', error);
            }
        };

        fetchUserData();
    }, []); // Empty dependency array ensures this runs only once on mount

    const refreshList = async () => {
        setLoading(true);
        // Add logic to refresh data if needed
        setLoading(false);
    };

    return (
        <Layout>
            <Content style={{ padding: "0 48px" }}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>User Profile</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        padding: 20,
                        background: theme.useToken().token.colorBgContainer,
                        borderRadius: theme.useToken().token.borderRadiusLG,
                    }}
                >
                    <Card bordered={false} loading={loading}>
                        <StorageImage
                            alt={defaultCover}
                            path='uploads/1735195523776_bell__notification.jpg'
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'contain',
                                objectPosition: 'center',
                            }}
                        />

                        <Descriptions
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>
                                        User Information
                                    </span>
                                    <Dropdown menu={{ items: dropdownItems }}>
                                        <Button onClick={(e) => e.preventDefault()}
                                            style={{ marginLeft: 'auto' }}>

                                            <Space>
                                                Actions
                                                <DownOutlined />
                                            </Space>

                                        </Button>

                                    </Dropdown>
                                </div>
                            }
                            style={{
                                marginBottom: 32,
                            }}
                        >
                            <Descriptions.Item label="Username">
                                {userAttributes?.username || 'Loading...'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {userAttributes?.email || 'Loading...'}
                            </Descriptions.Item>
                            <Descriptions.Item label="User Type">
                                {userAttributes?.userType || 'Loading...'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Notification Subscription">
                                {userAttributes?.isSubscribed ? 'True' : 'False'}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider
                            style={{
                                marginBottom: 32,
                            }}
                        />
                    </Card>
                </div>
            </Content>
            <Footer style={{ textAlign: "center" }}>
                Lost&Found ©{new Date().getFullYear()} Created by Elijah
            </Footer>

            {/* Update Modal */}
            {updateProfileModalVisible && (
                <UpdateProfileModal
                    profile={{
                        username: userAttributes?.username || '',
                        profile_pic: userAttributes?.profilePic || '',
                        auth_type: userAttributes?.authType || '',
                        is_subscribed: userAttributes?.authType || '', 
                    }}
                    onProfileUpdated={() => {
                        refreshList();
                        setUpdateProfileModalVisible(false);
                    }}
                    onCancel={() => setUpdateProfileModalVisible(false)}
                />
            )}

            {/* Change Password Modal */}
            {changePasswordModalVisible && (
                <div>
                    Change Password
                </div>
            )}
        </Layout>
    );
};

export default ProfilePage;