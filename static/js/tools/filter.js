export function dictFilter(dict, condition, type) {
    return dict.filter(item => {
        // 根据type判断是需要满足所有条件，还是任意一个条件
        if (type === 'ALL') {
            // 满足所有条件
            return Object.keys(condition).every(key => {
                return item[key] === condition[key];
            });
        } else if (type === 'ANY') {
            // 满足任意一个条件
            return Object.keys(condition).some(key => {
                return item[key] === condition[key];
            });
        }
        return false;
    });
}
