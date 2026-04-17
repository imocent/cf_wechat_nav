import { NextRequest } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

export async function GET(req: NextRequest) {
    const list = readJSON('groups.json');
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

    const start = (page - 1) * limit;
    const end = start + limit;
    const data = list.slice(start, end);

    return Response.json({
        code: 0,
        msg: '',
        count: list.length,
        data: data
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const list = readJSON('groups.json');

    // 获取现有最大数字 ID
    const maxId = list.reduce((max: number, item: any) => {
        const numId = parseInt(String(item.id));
        return !isNaN(numId) && numId > max ? numId : max;
    }, 0);

    list.push({
        id: String(maxId + 1),
        views: 0,
        status: 'pending',
        ...body
    });

    writeJSON('groups.json', list);
    return Response.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    const list = readJSON('groups.json');

    const newList = list.filter((g: any) => String(g.id) !== id);
    writeJSON('groups.json', newList);

    return Response.json({ success: true });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const list = readJSON('groups.json');

    const idx = list.findIndex((g: any) => String(g.id) === String(body.id));
    if (idx !== -1) {
        if (body.action) {
            // 审核操作
            if (body.action === 'approve') {
                list[idx].status = 'approved';
            } else if (body.action === 'reject') {
                list[idx].status = 'rejected';
            }
        } else {
            // 更新群组信息
            list[idx] = {...list[idx], ...body};
        }
    }

    writeJSON('groups.json', list);
    return Response.json({ success: true });
}
