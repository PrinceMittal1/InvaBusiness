import axios from 'axios'
import { apiUrl } from './env';


interface GetProductsRequestForSeller {
  customerUserId: string;
  sellerId: string;
}

export const getProductsForSellerPage = async (
  payload: GetProductsRequestForSeller
) => {
  try {
    const response = await axios.post('https://getsellerproducts-ty3v52ngjq-uc.a.run.app', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getProductsForWishlistPage = async (
  payload: any
) => {
  try {
    const response = await axios.post('https://getsavedproducts-ty3v52ngjq-uc.a.run.app', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};


export const updatingUser = async (payload: any) => {
  try {
    const response = await axios.post('http://127.0.0.1:5001/inva-b5b22/us-central1/updateCustomerUserDetail', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}



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

export const getProductsForHome = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}product/all/products/for/customer`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is ----- error ", error)
  }
};

export const toggleLike = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}product/like`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const toggleSaved = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}product/save`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

