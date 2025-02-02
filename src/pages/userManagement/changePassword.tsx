import { Form, Input, Modal, message } from 'antd';
import React, { useState } from 'react';
import { updatePassword } from 'aws-amplify/auth';

interface UpdatePasswordModalProps {
    onPasswordUpdated: () => void; // Callback to refresh the item details after updating
    onCancel: () => void; // Callback to close the modal
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ onPasswordUpdated, onCancel }) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            // Validate form fields
            await form.validateFields();
            const { oldPassword, newPassword } = form.getFieldsValue();

            // Start loading state
            setConfirmLoading(true);

            // Call Amplify's updatePassword function
            await updatePassword({
                oldPassword,
                newPassword,
            });

            // Show success message
            message.success('Password updated successfully!');

            // Reset form and close modal
            form.resetFields();
            onPasswordUpdated(); // Callback to refresh data if needed
            onCancel(); // Close the modal
        } catch (error) {
            console.error('Error updating password:', error);

            // Show error message
            message.error('Failed to update password. Please check your old password and try again.');
        } finally {
            // Stop loading state
            setConfirmLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields(); // Reset form fields
        onCancel(); // Close the modal
    };

    return (
        <Modal
            title="Update Password"
            open={true}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            okText="Update Password"
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Old Password"
                    name="oldPassword"
                    rules={[{ required: true, message: 'Please enter your old password' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                        { required: true, message: 'Please enter your new password' },
                        { min: 8, message: 'Password must be at least 8 characters long' },
                    ]}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdatePasswordModal;