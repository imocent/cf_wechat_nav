import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

// 获取所有区域 - 返回原始格式（用于 treeTable）
export async function GET(request: NextRequest) {
    const regions = readJSON('regions.json');
    return NextResponse.json(regions);
}

// 添加区域
export async function POST(request: NextRequest) {
    const { type, name, code, zipCode, parentId } = await request.json();
    const regions = readJSON('regions.json');

    if (type === 'country') {
        // 添加国家 - ID 范围: 1-9999
        const maxId = regions.countries.reduce((max: number, item: any) => {
            const numId = parseInt(item.id);
            return !isNaN(numId) && numId > max ? numId : max;
        }, 0);

        regions.countries.push({
            id: (maxId + 1).toString(),
            name,
            code
        });
    } else if (type === 'province') {
        // 添加省份 - ID 范围: 20000-29999
        const maxId = regions.provinces.reduce((max: number, item: any) => {
            const numId = parseInt(item.id);
            return !isNaN(numId) && numId > max && numId >= 20000 && numId < 30000 ? numId : max;
        }, 19999);

        regions.provinces.push({
            id: (maxId + 1).toString(),
            countryId: parentId,
            name,
            zipCode
        });
    } else if (type === 'city') {
        // 添加城市 - ID 范围: 30000-99999
        const maxId = regions.cities.reduce((max: number, item: any) => {
            const numId = parseInt(item.id);
            return !isNaN(numId) && numId > max && numId >= 30000 ? numId : max;
        }, 29999);

        regions.cities.push({
            id: (maxId + 1).toString(),
            provinceId: parentId,
            name,
            zipCode
        });
    }

    writeJSON('regions.json', regions);
    return NextResponse.json({ success: true });
}

// 更新区域
export async function PUT(request: NextRequest) {
    const { type, id, name, code, zipCode, parentId } = await request.json();
    const regions = readJSON('regions.json');

    if (type === 'country') {
        const country = regions.countries.find((c: any) => c.id === id);
        if (country) {
            country.name = name;
            country.code = code;
        }
    } else if (type === 'province') {
        const province = regions.provinces.find((p: any) => p.id === id);
        if (province) {
            province.name = name;
            if (zipCode !== undefined) {
                province.zipCode = zipCode;
            }
            // 支持修改父级国家
            if (parentId !== undefined) {
                province.countryId = parentId;
            }
        }
    } else if (type === 'city') {
        const city = regions.cities.find((c: any) => c.id === id);
        if (city) {
            city.name = name;
            if (zipCode !== undefined) {
                city.zipCode = zipCode;
            }
            // 支持修改父级省份
            if (parentId !== undefined) {
                city.provinceId = parentId;
            }
        }
    }

    writeJSON('regions.json', regions);
    return NextResponse.json({ success: true });
}

// 删除区域
export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const regions = readJSON('regions.json');

    if (type === 'country') {
        // 删除国家及其下属省份和城市
        const provincesToDelete = regions.provinces.filter((p: any) => p.countryId === id);
        const provinceIds = provincesToDelete.map((p: any) => p.id);

        regions.cities = regions.cities.filter((c: any) => !provinceIds.includes(c.provinceId));
        regions.provinces = regions.provinces.filter((p: any) => p.countryId !== id);
        regions.countries = regions.countries.filter((c: any) => c.id !== id);
    } else if (type === 'province') {
        // 删除省份及其下属城市
        regions.cities = regions.cities.filter((c: any) => c.provinceId !== id);
        regions.provinces = regions.provinces.filter((p: any) => p.id !== id);
    } else if (type === 'city') {
        regions.cities = regions.cities.filter((c: any) => c.id !== id);
    }

    writeJSON('regions.json', regions);
    return NextResponse.json({ success: true });
}
