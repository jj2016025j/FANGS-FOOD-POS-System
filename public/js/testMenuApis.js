// npm install axios
const axios = require('axios');

const baseUrl = 'http://localhost:3000'; // 更改為您的服務器地址和端口

// 獲取菜單列表
async function getMenu(categoryId) {
    try {
        const response = await axios.get(`${baseUrl}/menu`, {
            params: { category: categoryId }
        });
        console.log('獲取菜單列表:', response.data);
    } catch (error) {
        console.error('獲取菜單列表錯誤:', error.response.data);
    }
}

// 新增菜單項目
async function addItem() {
    try {
        const response = await axios.post(`${baseUrl}/items`, {
            Name: '新菜品',
            Description: '新菜品描述',
            Price: 99.99,
            CategoryId: 1, // 假設您已有此類別ID
            IsActive: true
        });
        console.log('新增菜單項目:', response.data);
    } catch (error) {
        console.error('新增菜單項目錯誤:', error.response.data);
    }
}

// 修改菜單項目
async function updateItem(itemId) {
    try {
        const response = await axios.put(`${baseUrl}/items/${itemId}`, {
            Name: '更新後的菜品',
            Description: '更新後的描述',
            Price: 88.88,
            CategoryId: 1, // 確保此ID存在
            IsActive: true
        });
        console.log('修改菜單項目:', response.data);
    } catch (error) {
        console.error('修改菜單項目錯誤:', error.response.data);
    }
}

// 刪除菜單項目
async function deleteItem(itemId) {
    try {
        const response = await axios.delete(`${baseUrl}/items/${itemId}`);
        console.log('刪除菜單項目:', response.data);
    } catch (error) {
        console.error('刪除菜單項目錯誤:', error.response.data);
    }
}

// 測試調用
getMenu(); // 獲取所有菜單列表
addItem(); // 新增一個菜單項目
updateItem(1); // 假設itemId為1的項目存在，進行修改
deleteItem(2); // 假設itemId為2的項目存在，進行刪除
