
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
const dir = path.join(process.cwd(),'data');

export function readJSON(name:string){
  const p = path.join(dir,name);
  if(!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p,'utf-8'));
}
export function writeJSON(name:string,data:any){
  fs.writeFileSync(path.join(dir,name),JSON.stringify(data,null,2));
}

// 验证 token
export function verifyToken(token: string) {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

// 检查管理员权限
export function checkAdminAuth(request: NextRequest) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        return null;
    }

    const user = verifyToken(token);

    if (user && user.role === 'admin') {
        return user;
    }

    return null;
}