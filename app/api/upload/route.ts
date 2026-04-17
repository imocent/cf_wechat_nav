import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const file = data.get('file') as File;

    if (!file) {
        return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = Date.now() + '.png';

    const uploadDir = path.join(process.cwd(), 'public', 'upload');

    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return Response.json({
        url: '/upload/' + fileName
    });
}
