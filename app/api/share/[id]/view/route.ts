import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

// 增加分享浏览量
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const share = readJSON('ads.json');
    const item = share.find((a: any) => a.id === params.id);

    if (item) {
        item.views = (item.views || 0) + 1;
        writeJSON('ads.json', share);
    }

    return NextResponse.json({ success: true });
}
