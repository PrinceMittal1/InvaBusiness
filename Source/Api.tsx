import axios from 'axios'
import { apiUrl } from './env';


export const creatingUserApi = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}seller/create`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (e: any) {
    if (axios.isAxiosError(e)) {
      return [e.response?.status, e.response?.data];
    } else {
      console.log("Unexpected Error:", e);
    }
  }
}

export const updatingUserApi = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}seller/updating`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
}

export const creatingProduct = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}product/create`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
}

export const fetchingMostPopularProduct = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}product/seller/products`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is ----- error ", error)
  }
}


export const deleteProduct = async ({ product_id }: any) => {
  try {
    const response = await axios.delete(`${apiUrl}product/delete/${product_id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};


export const profileDetailApi = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}seller/detail`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("respons eis ------- error", error)
    throw error;
  }
};


export const editProductApi = async (productId: string, payload: any) => {
  try {
    const response = await axios.put(
      `${apiUrl}product/edit/${productId}`,
      payload,
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is ------- error", error);
    throw error;
  }
};