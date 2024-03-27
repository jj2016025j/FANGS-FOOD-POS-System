// 找出本機IP位置的方法，可以找出區網及公網IP位置，但是公網會被防火牆擋住

const http = require('http');
// 能找出公網的地址但是無法使用 等較久需要用promise
// http://58.99.96.109
function getNetIPAddress() {
    return new Promise((resolve, reject) => {
        http.get('http://ipinfo.io/ip', (resp) => {
            let data = '';

            // 接收數據片段。
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // 數據接收完畢。
            resp.on('end', () => {
                resolve(data.trim());
            });

        }).on("error", (err) => {
            reject(err);
        });
    });
}


const os = require('os');
// 能回傳區網IP
// http://192.168.1.243:3000
function getLocalIPAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        for (const networkAddress of networkInterface) {
            if (networkAddress.family === 'IPv4' && !networkAddress.internal) {
                return networkAddress.address;
            }
        }
    }
    return null;
}

const https = require('https');

function getPublicIP() {
    return new Promise((resolve, reject) => {
        https.get('https://api.ipify.org/?format=json', (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const ipInfo = JSON.parse(data);
                    resolve(ipInfo.ip);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}

// 使用方式 會返回類似 http://58.99.96.109 的格式
// getNetIPAddress().then(ip => {
//     // // console.log("我的公網 IP 地址是: http://" + ip);
// }).catch(err => {
//     // console.log("錯誤: " + err.message);
// });

// 需要使用異步函數 會返回類似 58.99.96.109 的格式
getPublicIP()

// 會返回類似 192.168.1.243:3000 的格式
getLocalIPAddress() 

// 導出函數
module.exports = { getLocalIPAddress, getNetIPAddress, getPublicIP };
