const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const Jimp = require('jimp');
const qr = require('qr-image');
const streamToBuffer = require('stream-to-buffer');

// const device = new escpos.USB();
// const options = { encoding: "Big5", width: 42 }
// const printer = new escpos.Printer(device, options);

const getIp = require("./getIPAddress.js")
const LocalIP = getIp.getLocalIPAddress()
// function initPrinter() {
//     device = new escpos.USB();
//     options = { encoding: "Big5", width: 42 }
//     printer = new escpos.Printer(device, options);
// }

// 設定紙張尺寸 5.7, 8 輸入其他只會顯示內容不會打印
let size = 5.78
// let size = 8

// 列印QRCODE
function printOrderWithQR(url = `http://${LocalIP}:3000/pos`, orderNumber = 1, tableNumber = 1, contents = defaultContents) {
    device.open(function (error) {
        if (error) {
            console.error('打印機連接錯誤:', error);
            return;
        }
        console.log('打印機連接成功');
        console.log(url, orderNumber, tableNumber, contents);

        const qrContent = `${url}`;
        const qrCode = qr.imageSync(qrContent, { type: 'png', size: 10 });

        if (size == 5.7) {
            printer
                .font('a')
                .align('lt')
                .size(1, 1)
                .text(' Fang Food芳鍋')
                .feed(1)
                // .align('lt')
                .size(0, 0)
                .text(`           桌號: ${tableNumber}`)
                .text(`         訂單編號: ${orderNumber}`)
                .text(`  時間: ${formatDateTime(new Date())}`)
                .text('---------------------------')
                .qrimage(qrContent, { type: 'png', size: 5 }, function (err) {
                    this.feed()
                    this.align('lt')

                    console.log(`桌號: ${tableNumber}`);
                    console.log(`訂單編號: ${orderNumber}`);
                    console.log(`時間: ${formatDateTime(new Date())}`);
                    console.log(`QRCode: ${qrContent}`);

                    contents.forEach(content => {
                        this.text("      " + content)
                        console.log(content);
                    })

                    this
                        .feed(2)
                        .cut()
                        .close()
                });
        } else if (size == 8) {
            printer
                .font('a')
                .align('ct')
                .size(1, 1)
                .text('Fang Food芳鍋')
                .feed(1)
                // .align('lt')
                .size(0, 0)
                .text(`桌號: ${tableNumber}`)
                .text(`訂單編號: ${orderNumber}`)
                .text(`時間: ${formatDateTime(new Date())}`)
                .text('---------------------------')
                .qrimage(qrContent, { type: 'png', size: 10 }, function (err) {
                    this.feed()
                    this.align('ct')

                    console.log(`桌號: ${tableNumber}`);
                    console.log(`訂單編號: ${orderNumber}`);
                    console.log(`時間: ${formatDateTime(new Date())}`);
                    console.log(`QRCode: ${qrContent}`);

                    contents.forEach(content => {
                        this.text(content)
                        console.log(content);
                    })

                    this
                        .feed(2)
                        .cut()
                        .close()
                });
        } else {
            console.log("尺寸沒有支援")
        }

        console.log('打印結束');
        return true
    });
}

// 列印訂單
function printOrder(insertOrder = defaultOrderData) {
    // 定義預設參數
    const oldOrderData = defaultOrderData

    // 合併預設參數和傳入的自訂物件參數
    const order = { ...oldOrderData, ...insertOrder };
    console.log(order);
    device.open(function (error) {
        if (error) {
            console.error('打印機連接錯誤:', error);
            return;
        }
        console.log('打印機連接成功');

        if (size == 5.7) {
            printer
                .font('a')
                .align('lt')
                .size(1, 1)
                .text(" FangFood 芳鍋")
                .size(0, 0)
                .text('------------------------')

                .text('         訂單編號: ' + order.orderNumber)
                .align('lt')
                .text('下單日期: ' + order.orderDate)
                .text('地址: ' + order.address)
                .text('電話: ' + order.phone)
                // .align('ct')
                .text('------------------------')
                .align('lt')
                .text('菜單:')
                .size(0, 0)
                .text("名稱  單價 數量 總金額")
                .feed(1)

            order.items.forEach(item => {
                printer
                    .text(`${item.name}  ${item.unitPrice}  ${item.quantity}  ${item.totalPrice}`)
                    .feed(1)
            });

            printer
                .size(0, 0)
                .align('ct')
                .text('------------------------')
                .align('lt')
                .text('餐點總額: ' + order.total)
                // .text('服務費(' + order.serviceChargeRate + '%): ' + order.serviceCharge)
                // .text('總計: ' + (order.total + order.serviceCharge))
                // .text('支付方式: ' + order.paymentMethod)
                .align('ct')
                .text('------------------------')
                .align('lt')
                .text('特殊要求: ' + order.specialRequests)
                .feed(2)
                .cut()
                .close()
        } else if (size == 8) {
            printer
                .font('a')
                .align('ct')
                .size(1, 1)
                .text("FangFood 芳鍋")
                .size(0, 0)
                .text('------------------------')

                .text('訂單編號: ' + order.orderNumber)
                .align('lt')
                .text('下單日期: ' + order.orderDate)
                .text('地址: ' + order.address)
                .text('電話: ' + order.phone)
                .align('ct')
                .text('------------------------')
                .align('lt')
                .text('菜單:')
                .size(1, 1)
                .text("名稱  單價 數量 總金額")
                .feed(1)

            order.items.forEach(item => {
                printer
                    .text(`${item.name}  ${item.unitPrice}  ${item.quantity}  ${item.item}`)
                    .feed(1)
            });

            printer
                .size(0, 0)
                .align('ct')
                .text('------------------------')
                .align('lt')
                .text('餐點總額: ' + order.total)
                // .text('服務費(' + order.serviceChargeRate + '%): ' + order.serviceCharge)
                // .text('總計: ' + (order.total + order.serviceCharge))
                // .text('支付方式: ' + order.paymentMethod)
                .align('ct')
                .text('------------------------')
                .align('lt')
                .text('特殊要求: ' + order.specialRequests)
                .feed(2)
                .cut()
                .close()
        } else {
            console.log("尺寸沒有支援")
        }

        console.log('打印完成');
        return true
    });
}

// 列印發票
async function printInvoice(insertInvoiceData = defaultInvoiceData) {
    // 定義預設參數
    const oldInvoiceData = defaultInvoiceData

    // 合併預設參數和傳入的自訂物件參數
    const invoiceData = { ...oldInvoiceData, ...insertInvoiceData };
    // 組合左側二維條碼內容
    const leftQRContent = `${invoiceData.invoiceNumber}:${invoiceData.date}:${invoiceData.randomCode}:${invoiceData.salesAmount}:${invoiceData.totalAmount}:${invoiceData.buyerId}:${invoiceData.sellerId}:${invoiceData.encryptionInfo}`;

    // 組合右側二維條碼內容
    const rightQRContent = `**:${invoiceData.selfUseArea}:${invoiceData.itemCount}:${invoiceData.itemCount}:${invoiceData.encoding}:${invoiceData.products}`;

    device.open(async function (error) {
        if (error) {
            console.error(`打印機連接錯誤:`, error);
            return;
        }
        console.log(`打印機連接成功`);
        // 串接條碼內容
        const barcodeContent = `${invoiceData.invoicePeriod}${invoiceData.invoiceNumber}${invoiceData.randomCode}`;
        console.log(invoiceData);

        if (size == 5.7) {
            printer
                .font(`a`)
                .align(`lt`)
                .size(1, 1)
                .text(invoiceData.header)
                .style(`b`)// 加粗
                .size(1, 1)
                .text(`電子發票證明聯`)
                .size(1, 1)
                .text(` ${convertInvoicePeriod(invoiceData.invoicePeriod)}`)
                .text(` ${invoiceData.invoiceNumber}`)
                .style(`NORMAL`)
                .size(0, 0)
                .text(`     ${invoiceData.dateTime}`)
                .text(fillSpaces(`隨機碼:${invoiceData.randomCode}`, `總計${invoiceData.total}`, 22))
                .text(fillSpaces(`賣方:${invoiceData.sellerId}`, `買方:${invoiceData.buyerId}`, 22))
                .barcode(barcodeContent, `CODE39`, {
                    width: 1,
                    height: 50, // 單位mm
                    // position: OFF, // 不顯示條碼值 這條參數有問題
                    includeParity: false //EAN13/EAN8 bar code
                })

            const outputPath = await printMergedQRCodes(
                leftQRContent,
                rightQRContent
            ).catch(console.error);

            escpos.Image.load(outputPath, function (image) {
                printer
                    .raster(image)
                    .feed(2)
                    .cut()
                    .font(`a`)
                    .align(`lt`)
                    .size(0, 0)
                    .text(`公司: ${invoiceData.companyInfo}`)
                    .style(`NORMAL`)
                    .text(`發票編號: ${invoiceData.invoiceNumber}`)
                    .text(`開票日期: ${formatInvoiceDate(invoiceData.dateTime)}`)
                    .text(`統一編號: ${invoiceData.buyerId}`)
                    .text(`地址: ${invoiceData.address}`)
                    .text(`電話: ${invoiceData.phone}`)
                    .feed(1)
                    .text(`商品: `)

                printInvoiceItems(invoiceData.items);

                printer.feed(1)
                    .text(`商品總額: ${invoiceData.subTotal}`)
                    .text(`加值稅(10%): ${invoiceData.tax}`)
                    .text(`總計: ${invoiceData.total}`)
                    .feed(2)

                printReturnPolicy(invoiceData.returnPolicyTexts);

                printer
                    .feed(2)
                    .cut()
                    .close()
            });
        } else {
            console.log("尺寸沒有支援")
        }


        console.log(`打印完成`);
        return true
    });
}

const fillSpaces = (left, right, length) => {
    const spaces = length - (left.length + right.length);
    return left + ' '.repeat(spaces) + right;
};

const createQRCode = async (text, size) => {
    const qrStream = qr.image(text, { type: 'png', size: size });
    return new Promise((resolve, reject) => {
        streamToBuffer(qrStream, (err, buffer) => {
            if (err) reject(err);
            else Jimp.read(buffer).then(image => {
                // 调整图片大小至目标尺寸（例如，177x177像素）
                image.resize(177, 177); // Jimp.AUTO可用于自动调整宽度或高度
                resolve(image)
            }).catch(reject);
        });
    });
};

const mergeQRCodes = async (qr1, qr2) => {
    const mergedImage = new Jimp(qr1.bitmap.width + qr2.bitmap.width, Math.max(qr1.bitmap.height, qr2.bitmap.height));
    mergedImage.blit(qr1, 0, 0);
    mergedImage.blit(qr2, qr1.bitmap.width, 0);
    // 如果合并后的图像太宽，这里添加代码调整大小
    // 假设合并后的图像不应超过354像素宽（两个177像素的二维码并排）
    if (mergedImage.bitmap.width > 354) {
        mergedImage.resize(354, Jimp.AUTO);
    }
    return mergedImage;
};

const printMergedQRCodes = async (url1, url2) => {
    const qr1 = await createQRCode(url1, 5);
    const qr2 = await createQRCode(url2, 5);
    const mergedImage = await mergeQRCodes(qr1, qr2);
    const outputPath = 'output.png';
    await mergedImage.writeAsync(outputPath);
    return outputPath;
};

function convertInvoicePeriod(invoicePeriod) {
    const year = parseInt(invoicePeriod.substring(0, 3));
    const period = parseInt(invoicePeriod.substring(3));

    const startMonth = period - 1;
    const endMonth = startMonth + 1;

    return `${year}年${startMonth.toString().padStart(2, '0')}-${endMonth.toString().padStart(2, '0')}月`;
}

function printReturnPolicy(policyTexts) {
    policyTexts.forEach(text => {
        printer.text(text);
    });
}

function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 修改后的格式化并直接打印文本的函数
function printInvoiceItems(items) {
    // 首先打印标题
    printer.text('名稱      數量  單價  總金額');

    // 计算填充长度的函数保持不变
    const calculatePadding = (text, targetWidth) => {
        const chineseCharCount = text.replace(/[\x00-\xff]/g, "").length;
        const otherCharCount = text.length - chineseCharCount;
        const totalLength = chineseCharCount * 2 + otherCharCount;
        return text.padEnd(targetWidth + (text.length - totalLength), ' ');
    };

    // 遍历商品信息并直接打印每项
    items.forEach(item => {
        const name = calculatePadding(item.name, 12);
        const quantity = calculatePadding(item.quantity.toString(), 4);
        const unitPrice = calculatePadding(item.unitPrice.toString(), 8);
        const totalPrice = item.totalPrice.toString();
        printer.text(`${name}${quantity}${unitPrice}${totalPrice}`);
    });
}

function formatInvoiceDate(dateTime) {
    // 解析日期時間字符串為Date物件
    const date = new Date(dateTime);

    // 增加一天
    date.setDate(date.getDate() + 1);

    // 格式化輸出
    // 注意：getMonth() 從 0 開始，所以需要加1來獲得正確的月份
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    return formattedDate;
}

function convertToInvoiceFormat(orderItems) {
    // 將訂單項目轉換為電子發票格式的字串
    const invoiceItems = orderItems.map(item => {
        const { name, quantity, unit_price } = item;
        // 格式化為 "產品名稱:數量:單價:備註"
        return `${name}:${quantity}:${unit_price}:無`;
    });

    // 使用分號將不同產品分隔
    return invoiceItems.join(';');
}

// 使用函數並顯示結果
// const invoiceFormat = convertToInvoiceFormat(orderItems);
// console.log(invoiceFormat);

// 使用範例
const dateTime = '2024-03-18 11:22:33';

const defaultOrderData = {
    orderNumber: 'H123456789',
    orderDate: '2024-03-19',
    address: '台北市大安區忠孝東路100號',
    phone: '02-9876-5432',
    items: [
        { name: '牛肉片', price: 300, quantity: 1 },
        { name: '羊肉片', price: 350, quantity: 2 },
        { name: '高麗菜', price: 100, quantity: 1 },
        { name: '手工丸子', price: 150, quantity: 1 }
    ],
    total: 1250,
    serviceChargeRate: 10,
    serviceCharge: 125,
    paymentMethod: '信用卡',
    specialRequests: ''// '這裡是客人要求內容'
};

const defaultContents = ["本店酌收清潔費10%", "手機掃碼 立即點餐", "Fangs Food 芳鍋", "祝您用餐愉快"]

const defaultInvoiceData = {
    header: 'FangFood 芳鍋',
    dateTime: '2024-03-18 11:22:33',
    invoicePeriod: '10404',
    invoiceNumber: 'AB-12345678',
    randomCode: '1234',
    totalAmount: '100',
    sellerId: '53589318',
    buyerId: '79461349',
    companyInfo: '芳鍋企業有限公司',
    address: '台北市信義區市府路1號',
    phone: '02-1234-5678',
    items: [
        { name: 'LED顯示器', quantity: 1, unitPrice: 5000, totalPrice: 5000 },
        { name: '無線鍵盤', quantity: 2, unitPrice: 700, totalPrice: 1400 }
    ],
    subTotal: '6400',
    tax: '320',
    total: '6720',
    returnPolicyTexts: [
        '退換貨政策: ',
        '商品購買後30天內可退換，',
        '需保持商品完整包裝。'
    ],
    date: '1100301',
    salesAmount: '00002710', // 未稅銷售額，十六進位
    encryptionInfo: 'encryptedStringHere', // 假設的加密資訊
    selfUseArea: '**********', // 營業人自行使用區
    itemCount: '5',
    encoding: '1', // UTF-8編碼
    products: 'LED顯示器:1:500:無;無線鍵盤:2:750:無',
};

// 給convertToInvoiceFormat用
const orderItems = [
    { food_id: 37, quantity: 2, unit_price: 750, name: '牛肉鍋' },
    { food_id: 37, quantity: 2, unit_price: 750, name: '牛肉鍋' },
    { food_id: 37, quantity: 2, unit_price: 750, name: '牛肉鍋' },
    { food_id: 37, quantity: 2, unit_price: 750, name: '牛肉鍋' },
    { food_id: 37, quantity: 2, unit_price: 750, name: '牛肉鍋' }
];

// // 打印點餐QRCODE
// printOrderWithQR("https://lee871116.ddns.net/A78146133", "A78146133", "12", contents);

// // 打印訂單
// printOrder(orderData);

// // 打印發票
// printInvoice(invoiceData);


// module.exports = { printOrderWithQR, printOrder, printInvoice, initPrinter };
module.exports = { printOrderWithQR, printOrder, printInvoice, convertToInvoiceFormat };