"use client";
import React, { useState } from "react";
import {  Form, Input, Select, message, Modal } from "antd";
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const { TextArea } = Input;


const client = generateClient<Schema>();
console.log(client);

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

interface CreateModalProps {
    onItemCreated: () => void;
    onCancel: () => void;
  }

const CreateModal: React.FC<CreateModalProps> = ({ onItemCreated, onCancel })=> {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null); // File state


  const handleFileChange = (event: any) => {
    setFile(event.target.files[0]);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Check if file is selected, if so, upload to S3
      let filePath = "";
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
      }

      // Log if client.models.Item is available
      console.log(client?.models?.Item);

      if (!client?.models?.Item) {
        throw new Error("Item model is not available in the client.");
      }

      // Make the API call to create a new item
      const newItem = await client.models.Item.create({
        itemName: values.itemName,
        itemDesc: values.itemDesc,
        itemType: values.itemType,
        itemStatus: values.itemStatus,
        foundLostBy: values.foundLostBy,
        imagePath: filePath, 
      },
      {
        authMode: 'userPool',
      });

      console.log("Created new item:", newItem);

      message.success("Item added successfully!");
      onItemCreated(); // Refresh the item details
    } catch (error) {
      console.error("Error adding item:", error);
      message.error("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
          <Modal
            title="Create Item"
            open={true} 
            onOk={handleOk}
            confirmLoading={loading}
            onCancel={handleCancel}
          >
            <Form form={form} layout="vertical">
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
            </Form>
          </Modal>
  );
};

export default CreateModal;