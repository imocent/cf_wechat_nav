import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

// 获取所有分享
export async function GET(request: NextRequest) {
    const share = readJSON('ads.json');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    const start = (page - 1) * limit;
    const end = start + limit;
    const data = share.slice(start, end);

    return NextResponse.json({
        code: 0,
        msg: '',
        count: share.length,
        data: data
    });
}

// 添加分享
export async function POST(request: NextRequest) {
    const { title, description, link, image, position, status, startDate, endDate } = await request.json();
    const share = readJSON('ads.json');

    const maxId = share.reduce((max: number, item: any) => {
        const numId = parseInt(item.id);
        return !isNaN(numId) && numId > max ? numId : max;
    }, 0);

    share.push({
        id: (maxId + 1).toString(),
        title,
        description,
        link: link || '',
        image: image || '',
        position: position || 'top',
        status: status || 'inactive',
        startDate: startDate || '',
        endDate: endDate || '',
        views: 0
    });

    writeJSON('ads.json', share);
    return NextResponse.json({ success: true });
}

// 更新分享
export async function PUT(request: NextRequest) {
    const { id, title, description, link, image, position, status, startDate, endDate } = await request.json();
    const share = readJSON('ads.json');

    const item = share.find((a: any) => a.id === id);
    if (item) {
        item.title = title;
        item.description = description;
        item.link = link || '';
        item.image = image || '';
        item.position = position;
        item.status = status;
        item.startDate = startDate;
        item.endDate = endDate;
    }

    writeJSON('ads.json', share);
    return NextResponse.json({ success: true });
}

// 删除分享
export async function DELETE(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    const share = readJSON('ads.json');

    const newShare = share.filter((a: any) => a.id !== id);
    writeJSON('ads.json', newShare);
    return NextResponse.json({ success: true });
}
