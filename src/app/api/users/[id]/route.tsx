import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:301';

export async function GET(
  req: NextRequest,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('AuthToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await Promise.resolve((ctx as any).params);
    const { id } = params ?? {};
    const res = await axios.get(`${baseURL}/admin/api/users/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    const status = res.status || 500;
    const data = res.data ?? {};
    const response = NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
    if (status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
      try {
        response.cookies.set('AuthToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('RefreshToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('user_object', '', { expires: new Date(0), path: '/' });
        response.cookies.set('UserAuthenticated', '', { expires: new Date(0), path: '/' });
      } catch {}
    }
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch user', exception: e?.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('AuthToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await Promise.resolve((ctx as any).params);
    const { id } = params ?? {};
    const body = await req.json().catch(() => ({}));

    const res = await axios.patch(`${baseURL}/admin/api/users/${encodeURIComponent(id)}`, body, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    const status = res.status || 500;
    const data = res.data ?? {};
    const response = NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
    if (status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
      try {
        response.cookies.set('AuthToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('RefreshToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('user_object', '', { expires: new Date(0), path: '/' });
        response.cookies.set('UserAuthenticated', '', { expires: new Date(0), path: '/' });
      } catch {}
    }
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update user', exception: e?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('AuthToken')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await Promise.resolve((ctx as any).params);
    const { id } = params ?? {};
    const res = await axios.delete(`${baseURL}/admin/api/users/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    const status = res.status || 500;
    const data = res.data ?? {};
    const response = NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
    if (status === 401 || data?.reason === 'invalid_token' || data?.error === 'unauthorized') {
      try {
        response.cookies.set('AuthToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('RefreshToken', '', { expires: new Date(0), path: '/' });
        response.cookies.set('user_object', '', { expires: new Date(0), path: '/' });
        response.cookies.set('UserAuthenticated', '', { expires: new Date(0), path: '/' });
      } catch {}
    }
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete user', exception: e?.message }, { status: 500 });
  }
}
