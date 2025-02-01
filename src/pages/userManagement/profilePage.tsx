import { StorageImage } from '@aws-amplify/ui-react-storage';
import { Card, Descriptions, Divider, Layout, Breadcrumb, theme, Dropdown, Button, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { fetchUserAttributes, FetchUserAttributesOutput, fetchAuthSession } from 'aws-amplify/auth'; // Import FetchUserAttributesOutput
import UpdateProfileModal from './updateProfile';

const { Content, Footer } = Layout;

const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';

async function getUserGroups(): Promise<string> {
    try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken.payload['cognito:groups'] || [];
        return Array.isArray(groups) && groups.length > 0 ? String(groups[0]) : ''; // Ensure it's a string
    } catch (error) {
        console.error('Error fetching user groups:', error);
        return '';
    }
}


const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [userAttributes, setUserAttributes] = useState<FetchUserAttributesOutput | null>(null); // Properly type the state
    const [updateProfileModalVisible, setUpdateProfileModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [authType, setAuthType] = useState(userAttributes?.auth_type || '');

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

    

    useEffect(() => {
        if (!userAttributes?.auth_type) {
            getUserGroups().then(group => setAuthType(group)); // Ensuring 'group' is a string
        }
    }, [userAttributes?.auth_type]);
    

    // Fetch user attributes when the component mounts
    useEffect(() => {
        getUserGroups()
        const fetchUserData = async () => {
            try {
                const attributes = await fetchUserAttributes();
                setUserAttributes(attributes); // Set the fetched attributes to state
                console.log("User attributes: " + JSON.stringify(attributes, null, 2));
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
                            path={userAttributes?.profile_pic || 'uploads/1735195523776_bell__notification.jpg'}
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
                                {userAttributes?.username || 'Not Configured'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {userAttributes?.email || 'Loading...'}
                            </Descriptions.Item>
                            <Descriptions.Item label="User Type">
                                {authType || 'Loading...'}
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
                        auth_type: userAttributes?.authType || authType,
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