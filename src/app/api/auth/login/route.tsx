import axiosInstance from '@/utils/axios/axios';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // console.log('Start Login Action');

    // console.log('Received request:', request);

    const { email, password } = await request.json();
    // console.log('Parsed request body:', { email, password });

    // console.log('NEXT_PUBLIC_AUTH_API_LOGIN:', process.env.NEXT_PUBLIC_AUTH_API_LOGIN);

    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_AUTH_API_LOGIN!, {
      email,
      password,
    });

    // console.log('API response:', response);

    if (response.status === 200 || response.status === 201) {
      // console.log('Login successful:', response.data);
      return NextResponse.json({
        isApiHandled: true,
        isRequestSuccess: true,
        statusCode: response.status,
        message: 'Success',
        data: response.data.data,
        exception: []
      });
    } else {
      // console.log('Login failed with status:', response.status);
      return NextResponse.json({
        isApiHandled: true,
        isRequestSuccess: false,
        statusCode: response.status,
        message: response.data.message || 'Login failed',
        data: null,
        exception: []
      });
    }
  } catch (error: any) {
    const exceptionData = error.response?.data?.exception || [];
    const errorMessage = Array.isArray(exceptionData) && exceptionData.length > 0
      ? exceptionData // Keep the exception object/array as is
      : error.response?.data?.message;

    console.error('CATCH', error.response?.data);
    return NextResponse.json({
      isApiHandled: false,
      isRequestSuccess: false,
      statusCode: error.response?.status || 500,
      message: errorMessage,
      data: null,
      exception: exceptionData,
    });
  }
}
