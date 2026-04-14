interface FooterProps {
    text?: string;
    isAdmin?: boolean;
    style?: React.CSSProperties;
}

export default function Footer({ text, isAdmin, style }: FooterProps) {
    const defaultText = '© 2026 微信号群导航 - 连接每一个有趣的灵魂';
    const adminText = '© 2026 微信号群导航 - 管理后台';

    return (
        <div style={style}>
            {text || (isAdmin ? adminText : defaultText)}
        </div>
    );
}
