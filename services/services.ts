import axios from 'axios';
import {Store} from '../Redux/Store';

const ApiCall = async (
  type: string,
  url: string,
  obj: any = {},
  dispatch?: any,
  isMultipart: boolean = false,
) => {
  const state: any = Store.getState();
  const token = state?.userAuthReducer?.userData?.token || '';
  const currentUserId =
    state?.userAuthReducer?.userData?.user?._id ||
    state?.userAuthReducer?.userData?.user?.uid ||
    state?.userAuthReducer?.uid ||
    '';

// const Base = 'https://social-bea-apis.vercel.app/';
 const BASE_API_URL = 'https://firebase-course-pi.vercel.app/';
const Base = BASE_API_URL;
const BaseUrl = Base + url;

  const body = isMultipart
    ? obj
    : {
        ...obj,
      };

  console.log('API Request:', type.toUpperCase(), BaseUrl);

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'x-user-id': currentUserId,
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  let response: any = null;

  try {
    switch (type.toLowerCase()) {
      case 'post':
        response = await axios
          .post(BaseUrl, body, {
            headers: {
              ...defaultHeaders,
              'Content-Type': isMultipart
                ? 'multipart/form-data'
                : 'application/json',
            },
          })
          .then(res => res.data);
        break;

      case 'get':
        response = await axios
          .get(BaseUrl, {
            headers: defaultHeaders,
          })
          .then(res => res.data);
        break;

      case 'delete':
        response = await axios
          .delete(BaseUrl, {
            headers: {
              ...defaultHeaders,
              'Content-Type': 'application/json',
            },
            data: body,
          })
          .then(res => res.data);
        break;

      case 'put':
        response = await axios
          .put(BaseUrl, body, {
            headers: {
              ...defaultHeaders,
              'Content-Type': 'application/json',
            },
          })
          .then(res => res.data);
        break;

      default:
        break;
    }
  } catch (error: any) {
    console.error(`API Error [${type.toUpperCase()} ${BaseUrl}]:`, error?.response?.data || error.message);
    response = error?.response?.data || {
      success: false,
      message: error.message || 'Network request failed',
    };
  }

  return response;
};

export default ApiCall;
