import React, { useState, useEffect } from 'react';
import {
    Breadcrumb,
    Layout,
    theme,
    Card,
    Col,
    Row,
    Avatar,
    Pagination,
    Input,
    Select,
    Dropdown,
} from 'antd';
import { CarryOutOutlined, CommentOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import UpdateModal from './updateItemModal';
import DeleteModal from './deleteItemModal';
import type { Schema } from '../../../amplify/data/resource';

const { Meta } = Card;
const { Content, Footer } = Layout;
const { Search } = Input;

// Generate the Amplify client
const client = generateClient<Schema>();

const defaultAvatar = 'https://api.dicebear.com/7.x/miniavs/svg?seed=defaultAvatar';
const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';

const App: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [colSpan, setColSpan] = useState(6);
    const [loading, setLoading] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const onSearch = (value: string) => {
        console.log('Search:', value);
    };

    const updateColSpan = () => {
        const width = window.innerWidth;
        if (width < 576) {
            setColSpan(24);
        } else if (width < 768) {
            setColSpan(12);
        } else if (width < 992) {
            setColSpan(8);
        } else {
            setColSpan(6);
        }
    };

    const refreshList = async () => {
        setLoading(true);
        try {
            const response = await client.models.Item.list({ authMode: 'userPool' });
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshList();
        setUpdateModalVisible(true);
        window.addEventListener('resize', updateColSpan);

        return () => {
            window.removeEventListener('resize', updateColSpan);
        };
    }, []);

    const handleClaimStatusChange = async (item: any) => {
        const newStatus = item.itemStatus === 'Unclaimed' ? 'Claimed' : 'Unclaimed';
        try {
            await client.models.Item.update(
                {
                    id: item.id,
                    itemStatus: newStatus,
                },
                {
                    authMode: 'userPool',
                }
            );
            refreshList();
        } catch (error) {
            console.error('Error updating item status:', error);
        }
    };

    const descriptionStyle = {
        display: '-webkit-box',
        webkitBoxOrient: 'vertical',
        overflow: 'hidden',
        webkitLineClamp: 2,
        height: '40px',
    };

    const getDropdownItems = (item: any) => [
        {
            key: '1',
            label: (
                <span
                    onClick={() => {
                        setSelectedItem(item); // Set the selected item
                        setUpdateModalVisible(true); // Show the Update Modal
                    }}
                >
                    Update Item
                </span>
            ),
        },
        {
            key: '2',
            label: (
                <span
                    onClick={() => {
                        setSelectedItem(item); // Set the selected item
                        setDeleteModalVisible(true); // Show the Delete Modal
                    }}
                >
                    Delete Item
                </span>
            ),
            danger: true,
        },
    ];

    return (
        <Layout>
            <Content style={{ padding: '0 48px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>Lost & Found</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        padding: 20,
                        background: theme.useToken().token.colorBgContainer,
                        borderRadius: theme.useToken().token.borderRadiusLG,
                    }}
                >
                    <Search placeholder="Search" allowClear onSearch={onSearch} style={{ width: 400, margin: '0 16px 16px 0' }} />
                    <Select labelInValue defaultValue={{ value: 'latest', label: 'Latest' }} style={{ width: 120 }}>
                        <Select.Option value="latest">Latest</Select.Option>
                        <Select.Option value="lost">Lost Item</Select.Option>
                        <Select.Option value="found">Found Item</Select.Option>
                    </Select>
                    <Row gutter={[40, 40]}>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            items.map((item) => (
                                <Col span={colSpan} key={item.id}>
                                    <Card
                                        style={{ width: 250, height: 320 }}
                                        cover={
                                            <StorageImage
                                                alt={item.itemName}
                                                path={item.imagePath || defaultCover}
                                                style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'contain',
                                                    objectPosition: 'center',
                                                }}
                                            />
                                        }
                                        actions={[
                                            <CarryOutOutlined
                                                key="claim"
                                                style={{
                                                    color: item.itemStatus === 'Claimed' ? 'green' : 'black',
                                                }}
                                                onClick={() => handleClaimStatusChange(item)}
                                            />,
                                            <CommentOutlined key="comment" />,
                                            <Dropdown menu={{ items: getDropdownItems(item) }}>
                                                <EllipsisOutlined key="ellipsis" />
                                            </Dropdown>,
                                        ]}
                                    >
                                        <Link to={`/catalogPage/${item.id}`}>
                                            <Meta
                                                avatar={<Avatar src={item.avatar || defaultAvatar} />}
                                                title={item.itemName}
                                                description={<div style={descriptionStyle}>{item.itemDesc}</div>}
                                            />
                                        </Link>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                    <Pagination align="center" defaultCurrent={1} total={50} />
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Lost&Found ©{new Date().getFullYear()} Created by Elijah
            </Footer>

            {/* Update Modal */}
            {updateModalVisible && selectedItem && (
                <UpdateModal
                    item={{
                        id: selectedItem.id,
                        itemName: selectedItem.itemName,
                        description: selectedItem.itemDesc,
                        type: selectedItem.itemType,
                        status: selectedItem.itemStatus,
                        foundLostBy: selectedItem.foundLostBy,
                        imagePath: selectedItem.imagePath,
                    }}
                    onItemUpdated={() => {
                        refreshList();
                        setUpdateModalVisible(false);
                    }}
                    onCancel={() => setUpdateModalVisible(false)} // Close modal when canceled
                />
            )}

            {/* Delete Modal */}
            {deleteModalVisible && selectedItem && (
                <DeleteModal
                    item={selectedItem}
                    onItemDeleted={() => {
                        refreshList();
                        setDeleteModalVisible(false);
                    }}
                    onCancel={() => setDeleteModalVisible(false)} // Close modal when canceled
                />
            )}
        </Layout>
    );
};

export default App;
