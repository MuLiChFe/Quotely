export function hexToRgbA(hex, alpha = 1, dimmer = 0) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r - dimmer}, ${g - dimmer}, ${b - dimmer}, ${alpha})`;
}
