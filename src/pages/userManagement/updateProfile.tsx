import { Form, Input, Modal, Select, message, Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

interface UpdateProfileModalProps {
    profile: {
        userId: string;
        userEmail: string;
        username: string;
        profilePath: string;
        authType: string;
        isSubscribed: string;
    };
    onProfileUpdated: () => void;
    onCancel: () => void;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ profile, onProfileUpdated, onCancel }) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const [file, setFile] = useState<File | null>(null);
    const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
    const [verifying, setVerifying] = useState(false); // Tracks if verification is in progress

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = event.target.files;
        if (fileInput && fileInput[0]) {
            setFile(fileInput[0]);
        }
    };


    // **Check SES Email Verification Status**
    const fetchEmailVerificationStatus = async () => {
        console.log("response data hi ")
        try {
            const userEmail = profile.userEmail;
            const response = await client.queries.checkEmailSESStatus({ userEmail }, { authMode: 'userPool' });

            console.log("response data"+ response.data)
            const data = response.data as { VerificationStatus?: string };
            if (data.VerificationStatus === "Success") {
                setEmailVerified(true);
                setVerifying(false); // Stop loading once verified
            } else {
                setEmailVerified(false);
            }
        } catch (error) {
            console.error("Error checking SES verification status:", error);
            setEmailVerified(false);
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            username: profile.username,
            authType: profile.authType,
            isSubscribed: profile.isSubscribed,
        });
        console.log("response data test ")

        fetchEmailVerificationStatus();
    },[]);

    // **Poll email verification status**
    useEffect(() => {
        if (verifying) {
            const interval = setInterval(() => {
                fetchEmailVerificationStatus();
            }, 5000); // Check every 5 seconds

            return () => clearInterval(interval);
        }
    }, [verifying]);

    // **Handle Email Verification Request**
    const handleVerifyEmail = async () => {
        try {
            setVerifying(true); // Start the loading indicator
            const userEmail = profile.userEmail;
            await client.queries.verifyEmailSES({ userEmail }, { authMode: 'userPool' });
            message.success("Verification email sent! Please check your inbox.");
        } catch (error) {
            console.error("Error verifying email:", error);
            message.error("Failed to send verification email.");
            setVerifying(false);
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setConfirmLoading(true);

            let filePath = "";
            if (file) {
                const fileKey = `profilepics/${Date.now()}_${file.name}`;
                filePath = fileKey;
                await uploadData({
                    path: fileKey,
                    data: file,
                    options: { bucket: 'ca-as1-lostnfound' }
                }).result;
            }

            const { errors } = await client.models.UserProfile.update({
                userId: profile.userId,
                username: values.username,
                authType: values.authType,
                profilePath: filePath || profile.profilePath,
                isSubscribed: values.isSubscribed
            }, { authMode: 'userPool' });

            if (errors) {
                message.error('Failed to update item. Please try again.');
                console.error(errors);
                setConfirmLoading(false);
                return;
            }

            message.success('Item updated successfully!');
            setConfirmLoading(false);
            onProfileUpdated();
            onCancel();
        } catch (error) {
            console.error(error);
            message.error('Failed to update item.');
            setConfirmLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <Modal
            title="Update Profile"
            open={true}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter your username' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Receive Notification" name="isSubscribed">
                    <Select disabled={!emailVerified}>
                        <Select.Option value="True">True</Select.Option>
                        <Select.Option value="False">False</Select.Option>
                    </Select>
                </Form.Item>

                {!emailVerified && (
                    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <p style={{ color: 'red' }}>Your email is not verified for notifications.</p>
                        <Button type="primary" onClick={handleVerifyEmail} disabled={verifying}>
                            Verify Email
                        </Button>
                        {verifying && <Spin size="small" />}
                    </div>
                )}

                <Form.Item label="Auth Type" name="authpe">
                    <Select disabled>
                        <Select.Option value="Admin">Admin</Select.Option>
                        <Select.Option value="Student">Student</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Profile Picture">
                    <input type="file" onChange={handleFileChange} accept="image/*" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateProfileModal;
