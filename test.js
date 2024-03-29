
function generateOrderId() {
    // 你的自定義ID生成邏輯
    return 'ORD' + new Date().getTime() + Math.random().toString(36).substring(2, 15);
}

console.log(generateOrderId());
console.log(new Date(),"2024-03-29T07:20:13.509Z");
console.log(new Date().getTime(),"1711697084460");
console.log(Math.random(),"0.6662227391230504");
console.log(Math.random().toString(36),"0.5cn61ky20ig");
console.log(Math.random().toString(36).substring(2, 15),"jeufhkadbid");
console.log(Date.now(),"1711697084461");
console.log(Math.random().toString(36).substring(4),"xuj6gzscr");
console.log('ORD' + Date.now() + Math.random().toString(36).substring(4),"ORD171169708446134y3p5jpr");
