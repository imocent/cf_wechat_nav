import { NextRequest } from 'next/server';
import fs from 'fs';

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const file = data.get('file') as File;

    if (!file) {
        return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = Date.now() + '.png';

    const filePath = 'public/upload/' + fileName;
    fs.writeFileSync(filePath, buffer);

    return Response.json({
        url: '/upload/' + fileName
    });
}
