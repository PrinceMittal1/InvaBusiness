import axios from 'axios'

export const createVectorForUser = async (productUserId: string, title : string, productType : string, tags:any, seller : string) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:5001/inva-b5b22/us-central1/createVectorForProduct",
      { productUserId, title, productType, tags, seller },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error toggling like:", error.response?.data || error.message);
    throw error;
  }
};

