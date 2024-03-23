// 假設從資料庫中獲取的時間字符串為
const isoString = '2024-03-23T13:45:47.000Z';
function TimeFormat(isoString) {
  // 將 ISO 字符串轉換為 Date 物件
  const date = new Date(isoString);
  
  // 方法 2: 使用 toLocaleString (簡便方法，但自定義選項有限)
  const formattedDate = date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');

  console.log(formattedDate); // 輸出格式可能與上面略有不同，依瀏覽器和地區設定而定
  return formattedDate;
}

// // 使用 Intl.DateTimeFormat 或 Date.prototype.toLocaleString() 進行格式化
// // 方法 1: 使用 Intl.DateTimeFormat (更推薦，因為它提供了更多自定義選項)
// const formattedDate = new Intl.DateTimeFormat('zh-TW', {
//   year: 'numeric',
//   month: '2-digit',
//   day: '2-digit',
//   hour: '2-digit',
//   minute: '2-digit',
//   second: '2-digit',
//   hour12: false // 使用24小時制
// }).format(date);

// console.log(formattedDate); // 輸出格式為 "2024/03/23 21:45:47"

module.exports = { TimeFormat };