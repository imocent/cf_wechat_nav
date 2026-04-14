import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'menu.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const menu = JSON.parse(fileContents);
        return NextResponse.json(menu);
    } catch (error) {
        // 如果文件不存在，返回默认菜单
        const defaultMenu = [
            { id: 'dashboard', name: '控制台', icon: 'layui-icon-home', path: '/admin' },
            { id: 'groups', name: '群组管理', icon: 'layui-icon-group', path: '/admin/groups' },
            { id: 'categories', name: '分类管理', icon: 'layui-icon-list', path: '/admin/categories' },
            { id: 'regions', name: '区域管理', icon: 'layui-icon-location', path: '/admin/regions' },
            { id: 'share', name: '分享管理', icon: 'layui-icon-template-1', path: '/admin/share' }
        ];
        return NextResponse.json(defaultMenu);
    }
}
