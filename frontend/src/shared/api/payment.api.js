import axios from "axios";

import { API_BASE_URL } from "../config/api.js";

export const initiateEsewaPayment = async ({ bookingId }) => {
  const response = await axios.post(
    `${API_BASE_URL}/payment/esewa/initiate`,
    { booking_id: bookingId },
    { withCredentials: true },
  );

  return response.data;
};

export const checkEsewaPaymentStatus = async ({ transactionUuid, transactionCode }) => {
  const response = await axios.post(
    `${API_BASE_URL}/payment/esewa/status`,
    {
      transaction_uuid: transactionUuid,
      transaction_code: transactionCode,
    },
    { withCredentials: true },
  );

  return response.data;
};

export const getPaymentByBooking = async ({ bookingId }) => {
  const response = await axios.get(`${API_BASE_URL}/payment/booking/${bookingId}`, {
    withCredentials: true,
  });

  return response.data;
};
