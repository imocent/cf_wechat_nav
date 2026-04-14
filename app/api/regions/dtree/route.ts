import { NextResponse } from 'next/server';
import { readJSON } from '@/lib/db';

// 获取 DTree 格式的区域数据
export async function GET() {
    const regions = readJSON('regions.json');

    // 构建符合 DTree 格式的扁平数据列表
    const dtreeData: any[] = [];

    // 添加根节点（ID 为 0）
    dtreeData.push({
        id: 0,
        title: '根节点（添加国家）',
        parentId: null,
        levels: 0,
        checked: false,
        open: true,
        iconSkin: '',
        checkArr: [{checked: '0', type: '0'}]
    });

    // 添加国家节点作为顶级节点（parentId 为 0，即根节点）
    regions.countries.forEach((country: any) => {
        const hasProvinces = regions.provinces.some((p: any) => p.countryId === country.id);
        dtreeData.push({
            id: parseInt(country.id),
            title: country.name,
            parentId: 0,  // 国家的父级是根节点
            levels: 1,
            checked: false,
            open: true,
            iconSkin: '',
            checkArr: [{checked: '0', type: '0'}],
            code: country.code
        });
    });

    // 添加省份节点
    regions.provinces.forEach((province: any) => {
        dtreeData.push({
            id: parseInt(province.id),
            title: province.name,
            parentId: parseInt(province.countryId),
            levels: 2,
            checked: false,
            open: false,
            iconSkin: '',
            checkArr: [{checked: '0', type: '0'}],
            code: province.zipCode
        });
    });

    return NextResponse.json({
        code: 200,
        msg: 'success',
        data: dtreeData,
        count: dtreeData.length
    });
}
