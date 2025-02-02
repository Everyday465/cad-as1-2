import {
    updateUserAttribute,
    type UpdateUserAttributeOutput
} from 'aws-amplify/auth';


import { Form, Input, Modal, Select, message } from 'antd';
import React, { useEffect, useState } from 'react';

import { uploadData } from 'aws-amplify/storage';

async function handleUpdateUserAttribute(attributeKey: string, value: string) {
    try {
        const output = await updateUserAttribute({
            userAttribute: {
                attributeKey,
                value
            }
        });
        handleUpdateUserAttributeNextSteps(output);
    } catch (error) {
        console.log(error);
    }
}

function handleUpdateUserAttributeNextSteps(output: UpdateUserAttributeOutput) {
    const { nextStep } = output;

    switch (nextStep.updateAttributeStep) {
        case 'CONFIRM_ATTRIBUTE_WITH_CODE':
            const codeDeliveryDetails = nextStep.codeDeliveryDetails;
            console.log(
                `Confirmation code was sent to ${codeDeliveryDetails?.deliveryMedium}.`
            );
            // Collect the confirmation code from the user and pass to confirmUserAttribute.
            break;
        case 'DONE':
            console.log(`attribute was successfully updated.`);
            break;
    }
}

interface UpdateProfileModalProps {
    profile: {
        username: string;
        profilePath: string;
        authType: string;
        isSubscribed: string;
    };
    onProfileUpdated: () => void; // Callback to refresh the item details after updating
    onCancel: () => void; // Callback to close the modal
}


const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ profile, onProfileUpdated, onCancel }) => {

    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const [file, setFile] = useState<File | null>(null); // File state
   

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = event.target.files;
        if (fileInput && fileInput[0]) {
            setFile(fileInput[0]); // Set the selected file
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            username: profile.username,
            authType: profile.authType,
            isSubscribed: profile.isSubscribed,
        });
    }, [form, profile]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setConfirmLoading(true);

            // Check if file is selected, if so, upload to S3
            let filePath = "";
            if (file) {
                // Upload the file to S3
                const fileKey = `profilepics/${Date.now()}_${file.name}`;
                filePath = fileKey;
                await uploadData({
                    path: fileKey,
                    data: file,
                    options: {
                        bucket: 'ca-as1-lostnfound'
                    }
                }).result;
            }


            try {
                handleUpdateUserAttribute("username", values.username)
                handleUpdateUserAttribute("auth_type", values.authType)
                handleUpdateUserAttribute("profile_pic", filePath || values.profilePath)
                handleUpdateUserAttribute("is_subscribed", values.isSubscribed)

            } catch (error) {
                message.error('Failed to update item. Please try again.');
                console.error(error);
                setConfirmLoading(false);
                return;
            }

            message.success('Item updated successfully!');
            setConfirmLoading(false);
            onProfileUpdated(); // Refresh the item details
            onCancel(); // Close the modal
        } catch (error) {
            console.error(error);
            message.error('Failed to update item.');
            setConfirmLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel(); // Close the modal
    };


    return (
        <Modal
            title="Update Item"
            open={true}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please enter your username' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Receive Notification"
                    name="type"
                    rules={[{ required: true, message: 'Please select subscription status' }]}
                >
                    <Select>
                        <Select.Option value="True">True</Select.Option>
                        <Select.Option value="False">False</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Auth Type"
                    name="authType"
                >
                    <Select disabled>
                        <Select.Option value="Admin">Admin</Select.Option>
                        <Select.Option value="Student">Student</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Profile Picture"
                >
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
export default UpdateProfileModal;