import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

interface DeleteModalProps {
  item: {
    id: string;
    itemName: string;
  };
  onItemDeleted: () => void; // Callback to refresh the list after deleting
  onCancel: () => void; // Callback to close the modal
}

const DeleteModal: React.FC<DeleteModalProps> = ({ item, onItemDeleted, onCancel }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    setConfirmLoading(true);

    try {
      // Delete the item using the Amplify client
      const { errors } = await client.models.Item.delete(
        { id: item.id },
        { authMode: 'userPool' } // Adjust the auth mode if needed
      );

      if (errors) {
        message.error('Failed to delete item. Please try again.');
        console.error(errors);
        setConfirmLoading(false);
        return;
      }

      message.success('Item deleted successfully!');
      setConfirmLoading(false);
      onItemDeleted(); // Refresh the item list
      onCancel(); // Close the modal
    } catch (error) {
      console.error(error);
      message.error('Failed to delete item.');
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel(); // Close the modal
  };

  return (
    <Modal
      title={`Delete ${item.itemName}`}
      open={true}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <p>Are you sure you want to delete this item?</p>
    </Modal>
  );
};

export default DeleteModal;
