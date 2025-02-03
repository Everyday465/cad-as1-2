import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../amplify/data/resource';
import { uploadData } from 'aws-amplify/storage';
import { Predictions } from '@aws-amplify/predictions';

const client = generateClient<Schema>();

interface UpdateModalProps {
  item: {
    itemName: string;
    description: string;
    type: string;
    status: string;
    foundLostBy: string;
    imagePath: string;
    labels: string;
    id: string;
    updatedAt?: string;
  };
  onItemUpdated: () => void; // Callback to refresh the item details after updating
  onCancel: () => void; // Callback to close the modal
}

const UpdateModal: React.FC<UpdateModalProps> = ({ item, onItemUpdated, onCancel }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [file, setFile] = useState<File | null>(null);
  const [predictedLabels, setPredictedLabels] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files;
    if (fileInput && fileInput[0]) {
      setFile(fileInput[0]);
      handleLabelPrediction(fileInput[0]); // Predict labels when a new image is uploaded
    }
  };

  // Function to get labels from image using AWS Predictions
  const handleLabelPrediction = async (file: File) => {
    try {
      message.loading('Analyzing image for labels...');
      const result = await Predictions.identify({
        labels: {
          source: { file },
          type: "LABELS",
        },
      });

      if (result.labels && result.labels.length > 0) {
        const newLabels = result.labels.map(label => label.name).filter((name): name is string => !!name);
        setPredictedLabels(newLabels);
        message.success('Image analyzed successfully!');
      } else {
        message.warning('No labels detected.');
      }
    } catch (error) {
      console.error('Error detecting labels:', error);
      message.error('Failed to analyze image.');
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      status: item.status,
      foundLostBy: item.foundLostBy,
    });
  }, [form, item]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      let filePath = "";
      if (file) {
        const fileKey = `uploads/${Date.now()}_${file.name}`;
        filePath = fileKey;
        await uploadData({
          path: fileKey,
          data: file,
          options: { bucket: 'ca-as1-lostnfound' },
        }).result;
      }

      // Use predicted labels if available, otherwise keep the old ones
      const updatedLabels = predictedLabels.length > 0 ? predictedLabels : JSON.parse(item.labels);

      const { errors } = await client.models.Item.update(
        {
          id: item.id,
          itemName: values.itemName,
          itemDesc: values.description,
          itemType: values.type,
          itemStatus: values.status,
          foundLostBy: values.foundLostBy,
          imagePath: filePath || item.imagePath,
          labels: JSON.stringify(updatedLabels), // Save new labels if available
        },
        { authMode: 'userPool' }
      );

      if (errors) {
        message.error('Failed to update item. Please try again.');
        console.error(errors);
        setConfirmLoading(false);
        return;
      }

      message.success('Item updated successfully!');
      setConfirmLoading(false);
      onItemUpdated();
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
      title="Update Item"
      open={true}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Item Name" name="itemName" rules={[{ required: true, message: 'Please enter the item name' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter the description' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Item Type" name="type" rules={[{ required: true, message: 'Please select the item type' }]}>
          <Select>
            <Select.Option value="Found">Found Item</Select.Option>
            <Select.Option value="Lost">Lost Item</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select a status' }]}>
          <Select>
            <Select.Option value="Unclaimed">Unclaimed</Select.Option>
            <Select.Option value="Claimed">Claimed</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Found/Lost By" name="foundLostBy" rules={[{ required: true, message: 'Please enter who found/lost the item' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Item Image">
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </Form.Item>

        {predictedLabels.length > 0 && (
          <Form.Item label="Predicted Labels">
            {predictedLabels.map((label, index) => (
              <span key={index} style={{ marginRight: 5, padding: "5px 10px", background: "#eee", borderRadius: "5px" }}>
                {label}
              </span>
            ))}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default UpdateModal;
