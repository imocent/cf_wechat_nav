import fs from 'fs';
import { NextRequest } from 'next/server';
const file = 'data/categories.json';

export async function GET(req: NextRequest) {
    const list = JSON.parse(fs.readFileSync(file, 'utf-8'));
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
    const list = JSON.parse(fs.readFileSync(file, 'utf-8'));

    // 获取现有最大数字 ID
    const maxId = list.reduce((max: number, item: any) => {
        const numId = parseInt(item.id);
        return !isNaN(numId) && numId > max ? numId : max;
    }, 0);

    list.push({
        id: (maxId + 1).toString(),
        ...body
    });

    fs.writeFileSync(file, JSON.stringify(list, null, 2));
    return Response.json({ code: 0, msg: '添加成功' });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const list = JSON.parse(fs.readFileSync(file, 'utf-8'));

    const idx = list.findIndex((item: any) => item.id === body.id);
    if (idx !== -1) {
        list[idx] = { ...list[idx], ...body };
        fs.writeFileSync(file, JSON.stringify(list, null, 2));
        return Response.json({ code: 0, msg: '更新成功' });
    }

    return Response.json({ code: 1, msg: '未找到该分类' }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    const list = JSON.parse(fs.readFileSync(file, 'utf-8'));

    const newList = list.filter((item: any) => item.id !== id);

    fs.writeFileSync(file, JSON.stringify(newList, null, 2));
    return Response.json({ success: true });
}
