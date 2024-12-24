"use client";
import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Upload, Layout, Breadcrumb, message, theme } from "antd";
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const { TextArea } = Input;
const { Content, Footer } = Layout;

const client = generateClient<Schema>();
console.log(client);

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null); // File state

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]); // Set the selected file
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      console.log("Submitting values:", values);

      const { itemName, description, status } = values;

      // Check if file is selected, if so, upload to S3
      let fileKey = "";
      if (file) {
        // Upload the file to S3
        const fileKey = `uploads/${Date.now()}_${file.name}`; // Create a unique file name
        await uploadData({
            path: fileKey,
            data: file,
            options: {
              // Specify a target bucket using name assigned in Amplify Backend
              bucket: 'ca-as1-lostnfound'
            }
          }).result;
      }

      // Log if client.models.Item is available
      console.log(client?.models?.Item);

      if (!client?.models?.Item) {
        throw new Error("Item model is not available in the client.");
      }

      // Make the API call to create a new item
      const newItem = await client.models.Item.create({
        itemName,
        description,
        status,
        foundLostBy: "Anonymous", // Adjust if you have user information to pass
        imageUrl: fileKey, 
      });

      console.log("Created new item:", newItem);

      message.success("Item added successfully!");
      form.resetFields(); // Clear the form after submission
    } catch (error) {
      console.error("Error adding item:", error);
      message.error("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Create Item</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 20,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Form
            form={form}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            onFinish={handleSubmit} // Handle form submission
          >
            <Form.Item
              label="Item Name"
              name="itemName"
              rules={[{ required: true, message: "Please enter the item name" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter a description" }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Claim"
              name="status"
              rules={[{ required: true, message: "Please select a claim type" }]}
            >
              <Select>
                <Select.Option value="Found">Found Item</Select.Option>
                <Select.Option value="Lost">Lost Item</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Upload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                beforeUpload={() => false} // Disable automatic upload
                showUploadList={false} // Hide the default list
              >
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                  <input type="file" onChange={handleFileChange} />
                </button>
              </Upload>
            </Form.Item>

            <Form.Item style={{ textAlign: "center" }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Item
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Lost&Found ©{new Date().getFullYear()} Created by Elijah
      </Footer>
    </Layout>
  );
};

export default App;
