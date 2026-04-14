import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/lib/db';

export async function POST(request: NextRequest) {
    const { username, password } = await request.json();

    const users = readJSON('users.json');
    const user = users.find((u: any) => u.username === username && u.password === password);

    if (user) {
        // 生成简单的 token（实际项目应使用 JWT）
        const token = Buffer.from(JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role
        })).toString('base64');

        return NextResponse.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    }

    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
}