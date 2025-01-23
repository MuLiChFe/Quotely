export function hexToRgbA(hex, alpha = 1, dimmer = 0) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r - dimmer}, ${g - dimmer}, ${b - dimmer}, ${alpha})`;
}

export function hmsToSec(hms) {
    // 使用正则表达式匹配 "h:m:s" 格式的字符串
    const parts = hms.split(':');

    if (parts.length !== 3) {
        throw new Error('Invalid time format. Expected "h:m:s"');
    }

    const hours = parseInt(parts[0], 10);  // 获取小时并转换为整数
    const minutes = parseInt(parts[1], 10);  // 获取分钟并转换为整数
    const seconds = parseInt(parts[2], 10);  // 获取秒并转换为整数

    // 计算总秒数
    return hours * 3600 + minutes * 60 + seconds;
}