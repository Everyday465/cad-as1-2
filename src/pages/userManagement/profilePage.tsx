import { StorageImage } from '@aws-amplify/ui-react-storage';

import { Card, Descriptions, Divider, Layout, Breadcrumb, theme, Dropdown, Button, Space } from 'antd';
import React, { useEffect, useState } from 'react';

const { Content, Footer } = Layout;

import { DownOutlined } from '@ant-design/icons';

import { fetchUserAttributes } from 'aws-amplify/auth';
import UpdateProfileModal from './updateProfile';

const userAttributes = await fetchUserAttributes();


const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(false);

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

    const refreshList = async () => {
        setLoading(true);
        setLoading(false);

    };

    useEffect(() => {
        console.log(userAttributes)
    });

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
                            <Descriptions.Item label="Username">1000000000</Descriptions.Item>
                            <Descriptions.Item label="Email">已取货</Descriptions.Item>
                            <Descriptions.Item label="User Type">1234123421</Descriptions.Item>
                            <Descriptions.Item label="Notification Subscription">True</Descriptions.Item>
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
                        username: "userAttributes.",
                        profile_pic: "userAttributes.",
                        auth_type: "userAttributes.",
                        is_subscribed: true,

                    }}
                    onProfileUpdated={() => {
                        refreshList();
                        setUpdateProfileModalVisible(false);
                    }}
                    onCancel={() => setUpdateProfileModalVisible(false)}

                />
            )}

            {/* Delete Modal */}
            {changePasswordModalVisible && (
                <div>
                    change password
                </div>

            )}
        </Layout>

    );
};
export default ProfilePage;