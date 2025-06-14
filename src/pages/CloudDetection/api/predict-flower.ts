import axios from 'axios';
import type { IPredictFlowerRoboflowApi } from '../types';

export const predictFlowerRoboflowApi = async (
  base64String: string | ArrayBuffer,
  model: string = 'custom-workflow-2',
  token: string = 'hYbnyueb985om3zBKwIm'
): Promise<IPredictFlowerRoboflowApi> => {
  try {
    const { data } = await axios.post(
      `https://serverless.roboflow.com/infer/workflows/cap-jrn6k/${model}`,
      {
        api_key: token,
        inputs: {
          image: { type: 'base64', value: base64String },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
};
