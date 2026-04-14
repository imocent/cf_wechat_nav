import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

// 增加群组浏览量
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const groups = readJSON('groups.json');
    const group = groups.find((g: any) => g.id === params.id);

    if (group) {
        group.views = (group.views || 0) + 1;
        writeJSON('groups.json', groups);
    }

    return NextResponse.json({ success: true });
}
