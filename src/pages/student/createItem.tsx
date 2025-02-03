"use client";
import React, { useState } from "react";
import { Button, Form, Input, Select, Layout, Breadcrumb, message, theme } from "antd";
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Predictions } from '@aws-amplify/predictions';

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

      const { itemName, itemDesc, itemType, itemStatus, foundLostBy } = values;

      // Check if file is selected, if so, upload to S3
      let filePath = "";
      let labels = [];

      if (file) {
        // Upload the file to S3
        const fileKey = `uploads/${Date.now()}_${file.name}`;
        filePath = fileKey;
        await uploadData({
          path: fileKey,
          data: file,
          options: {
            bucket: 'ca-as1-lostnfound'
          }
        }).result;

        // Call Amplify Predictions to identify labels from the uploaded image
        const predictionResponse = await Predictions.identify({
          labels: {
            source: {
              file
            },
            type: 'LABELS'  // Use the appropriate type for label prediction
          }
        });

        // Extract labels from the response
        if (predictionResponse?.labels) {
          labels = predictionResponse.labels.map((label: any) => label.name);
        } else {
          // Fallback if no labels were detected
          console.log("No labels detected.");
          labels = [];
        }

        // If you want to store them as JSON, you can use JSON.stringify
        // labels = JSON.stringify(labels);
      }

      // Log if client.models.Item is available
      console.log(client?.models?.Item);

      if (!client?.models?.Item) {
        throw new Error("Item model is not available in the client.");
      }

      // Make the API call to create a new item
      const newItem = await client.models.Item.create({
        itemName,
        itemDesc,
        itemType,
        itemStatus,
        foundLostBy,
        imagePath: filePath,
        labels: JSON.stringify(labels)  // Add labels here
      },
        {
          authMode: 'userPool',
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
              name="itemDesc"
              rules={[{ required: true, message: "Please enter a description" }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Item Type"
              name="itemType"
              rules={[{ required: true, message: "Please select a claim type" }]}
            >
              <Select>
                <Select.Option value="Found">Found Item</Select.Option>
                <Select.Option value="Lost">Lost Item</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Status"
              name="itemStatus"
              rules={[{ required: true, message: "Please select a status" }]}
            >
              <Select>
                <Select.Option value="Unclaimed">Unclaimed</Select.Option>
                <Select.Option value="Claimed">Claimed</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Found/Lost By"
              name="foundLostBy"
              rules={[{ required: true, message: "Please enter who found/lost item" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Item Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <input type="file" onChange={handleFileChange}>
              </input>
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
