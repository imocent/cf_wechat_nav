import Script from 'next/script';
import './globals.css';

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html>
	        <head>
	            <title>微信群导航</title>
	            <meta name="description" content="微信群分享平台，副业/资源/交流"/>
	            <meta name="keywords" content="微信群,导航,副业群"/>
	            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/layui@2.9.6/dist/css/layui.css"/>
	            <link rel="stylesheet" href="/layui/css/layDtree.css"/>
	        </head>
	        <body>
	            {children}
	            {/* 先加载 layui */}
	            <Script
	                src="https://cdn.jsdelivr.net/npm/layui@2.9.6/dist/layui.js"
	                strategy="afterInteractive"
	            />
	            {/* layui 加载后立即加载 DTree 扩展模块 */}
	            <Script
	                src="/layui/js/layDtree.js"
	                strategy="afterInteractive"
	            />
	        </body>
	        </html>
	    );
}
