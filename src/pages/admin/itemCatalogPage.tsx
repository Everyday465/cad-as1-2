import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, List, theme, Input, Select, Pagination, Button, Space } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Content, Footer } = Layout;

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import UpdateModal from '../student/updateItemModal';
import DeleteModal from '../student/deleteItemModal';
import CreateModal from '../student/createItemModal';
import { Link } from 'react-router-dom';

const client = generateClient<Schema>();

const defaultCover = 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png';

const App: React.FC = () => {

    //misc variables
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    //modal variables
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [updateItemModalVisible, setUpdateItemModalVisible] = useState(false);
    const [createItemModalVisible, setCreateItemModalVisible] = useState(false);
    const [deleteItemModalVisible, setDeleteItemModalVisible] = useState(false);

    //user variables
    const { user } = useAuthenticator((context) => [context.user]);

    const onSearch = (value: string) => {
        const searchQuery = value.toLowerCase();
        const filtered = items.filter(item =>
            (item.itemName.toLowerCase().includes(searchQuery) || item.itemDesc.toLowerCase().includes(searchQuery))
        );
        setFilteredItems(filtered);
    };

    const refreshList = async () => {
        setLoading(true);
        try {
            const response = await client.models.Item.list({ authMode: 'userPool' });
            const userMeetings = response.data.filter(item => item.itemStatus);
            setItems(userMeetings);
            setFilteredItems(userMeetings);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (value: string) => {
        if (value === 'all') {
            setFilteredItems(items);
        } else {
            const filtered = items.filter(item => item.itemStatus === value);
            setFilteredItems(filtered);
        }
    };

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

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


    useEffect(() => {
        refreshList();
    }, [user]);

    return (
        <Layout>
            <Content style={{ padding: '0 48px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>Found Items</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    style={{
                        padding: 20,
                        background: theme.useToken().token.colorBgContainer,
                        borderRadius: theme.useToken().token.borderRadiusLG,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <Search
                                placeholder="Search by title or status"
                                allowClear
                                onSearch={onSearch}
                                style={{ width: 400 }}
                            />
                            <Select
                                labelInValue
                                defaultValue={{ value: 'all', label: 'All' }}
                                style={{ width: 200 }}
                                onChange={(value) => handleFilterChange(value.value)}
                            >
                                <Select.Option value="all">All</Select.Option>
                                <Select.Option value="Claimed">Claimed</Select.Option>
                                <Select.Option value="Unclaimed">Unclaimed</Select.Option>
                            </Select>
                        </div>
                        <Button
                            type="primary"
                            onClick={() => {
                                setCreateItemModalVisible(true);
                            }}
                        >
                            Add Found Item
                        </Button>
                    </div>
                    <List
                        loading={loading}
                        itemLayout="vertical"
                        size="large"
                        dataSource={filteredItems.slice(
                            (currentPage - 1) * pageSize,
                            currentPage * pageSize
                        )}
                        renderItem={(item) => (
                            <List.Item
                                key={item.title}
                                actions={[
                                    <Space
                                        onClick={() => {
                                            handleClaimStatusChange(item)
                                        }}
                                        style={{
                                            color: item.itemStatus === 'Claimed' ? 'green' : 'rgba(0, 0, 0, 0.45)',
                                        }}
                                    >
                                        {React.createElement(item.itemStatus === 'Claimed' ? CheckCircleOutlined : ClockCircleOutlined)}
                                        {item.itemStatus === 'Claimed' ? 'Claimed!' : 'Unclaimed'}
                                    </Space>,
                                    <Space onClick={() => {
                                        setSelectedItem(item);
                                        setUpdateItemModalVisible(true);
                                    }}>
                                        {React.createElement(EditOutlined)}
                                        {"Update"}
                                    </Space>,
                                    <Space onClick={() => {
                                        setSelectedItem(item);
                                        setDeleteItemModalVisible(true);
                                    }}>
                                        {React.createElement(DeleteOutlined)}
                                        {"Delete"}
                                    </Space>,

                                ]}
                                extra={
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
                            >
                                <Link to={`/catalogPage/${item.id}`}>
                                    <List.Item.Meta
                                        title={<a href="#">{item.itemName || 'Unknown'}</a>}
                                        description={`Description: ${item.itemDesc || 'N/A'}`}
                                    />
                                </Link>
                            </List.Item>
                        )}
                    />
                    <Pagination
                        current={currentPage}
                        total={filteredItems.length}
                        pageSize={pageSize}
                        showSizeChanger
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageChange}
                        style={{ marginTop: 16 }}
                    />
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Lost&Found ©{new Date().getFullYear()} Created by Elijah
            </Footer>


            {/* Create Modal */}
            {createItemModalVisible && (
                <CreateModal
                    onItemCreated={() => {
                        refreshList();
                        setCreateItemModalVisible(false);
                    }}
                    onCancel={() => setCreateItemModalVisible(false)} // Close modal when canceled
                />
            )}


            {/* Update Modal */}
            {updateItemModalVisible && selectedItem && (
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
                        setUpdateItemModalVisible(false);
                    }}
                    onCancel={() => setUpdateItemModalVisible(false)} // Close modal when canceled
                />
            )}

            {/* Delete Modal */}
            {deleteItemModalVisible && selectedItem && (
                <DeleteModal
                    item={selectedItem}
                    onItemDeleted={() => {
                        refreshList();
                        setDeleteItemModalVisible(false);
                    }}
                    onCancel={() => setDeleteItemModalVisible(false)} // Close modal when canceled
                />
            )}
        </Layout>
    );
};

export default App;