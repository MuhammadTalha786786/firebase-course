import axios from 'axios';
// import Config from "react-native-config";
import {Store} from '../Redux/Store';
import {Platform} from 'react-native';

const ApiCall = async (
  type: string,
  url: string,
  obj: {},
  dispatch: any,
  isMultipart: boolean = false,
) => {
  const token = '';

  let Base = 'http://10.0.2.2:8080/';
  let response = null;
  const BaseUrl =Base+url

  let body = isMultipart
    ? obj
    : {
        ...obj,
      };

  // console.log("token : ", token);
  console.log("BaseUrl : ", JSON.stringify(BaseUrl));
  // console.log("body : ", JSON.stringify(body));

  switch (type) {
    case 'post':
      response = await axios
        .post(BaseUrl, body, {
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        .then(async response => {
          return response.data;
        })
        .catch(async error => {
          console.log(error);
          //   let errHandlerResp = await errorHandler(error, dispatch);
          //   if (errHandlerResp.state) {
          //     return ApiCall(type, url, obj, dispatch, isMultipart);
          //   } else {
          //     return errHandlerResp.error;
          //   }
        });
      break;
    case 'get':
      response = await axios
        .get(BaseUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(async response => {
          return response.data;
        })
        .catch(async error => {
          console.log(error);
        });
      break;
    case 'delete':
      response = await axios
        .delete(BaseUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: body, // Add the payload here
        })
        .then(async response => {
          return response.data;
        })
        .catch(async error => {
          console.log(error);
        });
      break;
    case 'put':
      response = await axios
        .put(BaseUrl, body, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        .then(async response => {
          return response.data;
        })
        .catch(async error => {
          console.log(error);
        });
      break;
    default:
      break;
  }
  return response;
};
export default ApiCall;
