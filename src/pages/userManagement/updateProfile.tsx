import { Form, Input, Modal, Select, message, Spin, Typography } from 'antd';
const { Link } = Typography;
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
    const [createSub, setCreateSub] = useState<any>(null); // Subscription for creation

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

            if (response.data && typeof response.data === 'string') {
                const cleanData = JSON.parse(response.data); // This is safe now
                if (cleanData === "SUCCESS") {
                    setEmailVerified(true);
                    console.log("email success" + emailVerified)
                    setVerifying(false); // Stop loading once verified
                }
            } else {
                console.error("Received invalid or null data:", response.data);
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
        console.log("start" + emailVerified)
        fetchEmailVerificationStatus();
    }, []);


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

    // **Handle Subscription Logic**
    const handleSubscription = (isSubscribed: boolean) => {
        if (isSubscribed) {
            // Create subscriptions
            const createSubscription = client.models.Item.onCreate({ authMode: 'userPool' }).subscribe({
                next: async (data) => {
                    try {
                        console.log("Item created, sending notification...", data);

                        // Call the sendNotification API when an item is created
                        await client.queries.sendNotification({
                            itemId: data.id,
                            itemName: data.itemName,
                            itemDesc: data.itemDesc,
                            userEmail: profile.userEmail, // Use the user's email from the profile
                            createdAt: data.createdAt,
                        }, { authMode: 'userPool' });
            
                        console.log("Notification sent for item creation:", data);
                    } catch (error) {
                        console.error("Error sending notification:", error);
                    }
                },
                error: (error) => console.warn("Subscription error (create):", error),
            });
            setCreateSub(createSubscription);

        } else {
            // Unsubscribe from existing subscriptions
            if (createSub) {
                createSub.unsubscribe();
                setCreateSub(null);
            }
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

            // Handle subscription based on isSubscribed value
            console.log("issubscribed value" + values.isSubscribed)
            handleSubscription(values.isSubscribed === "True");

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
                    {!emailVerified && (
                        <div style={{ marginTop: 8, color: 'red', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <p style={{ margin: 0 }}>Your email is not verified for notifications.</p>
                            <Link
                                onClick={handleVerifyEmail}
                                disabled={verifying}
                                style={{ cursor: verifying ? 'not-allowed' : 'pointer' }}
                            >
                                Verify Email
                            </Link>
                            {verifying && <Spin size="small" />}
                        </div>
                    )}
                </Form.Item>
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
