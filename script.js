// 获取环境变量
const HOT_SEARCH_KEY = import.meta.env.VITE_JUHE_HOT_SEARCH_KEY;
const NEWS_KEY = import.meta.env.VITE_JUHE_NEWS_KEY;

function getRandomTimes() {
    const times = [];
    while (times.length < 5) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (!times.includes(time)) {
            times.push(time);
        }
    }
    return times.sort();
}

const scheduledTimes = getRandomTimes();
let currentCallCount = 0;
let hotSearchesData = [];
let newsHeadlinesData = [];

async function fetchData(type) {
    let apiUrl, params;

    if (type === 'hot-searches') {
        apiUrl = 'http://apis.juhe.cn/fapigx/networkhot/query';
        params = {
            key: HOT_SEARCH_KEY,
        };
    } else {
        apiUrl = 'http://v.juhe.cn/toutiao/index';
        params = {
            key: NEWS_KEY,
            type: 'top',
            page_size: 30,
        };
    }
     if (!apiUrl) return console.error("未设置api");
    if (!params.key) return console.error(`未设置 ${type === 'hot-searches' ? '热搜榜' : '新闻头条'} 的 API 密钥`);
    const urlParams = new URLSearchParams(params);
    apiUrl += `?${urlParams.toString()}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (type === 'hot-searches') {
            if (data && data.result && data.result.list) {
                hotSearchesData = data.result.list.slice(0, 30);
                displayData('hot-searches', hotSearchesData);
            } else {
                displayError('hot-searches', new Error('热搜数据格式不正确或为空'));
            }
        } else {
            if (data && data.result && data.result.data) {
                newsHeadlinesData = data.result.data.slice(0, 30);
                displayData('news-headlines', newsHeadlinesData);
            } else {
                displayError('news-headlines', new Error('新闻数据格式不正确或为空'));
            }
        }
    } catch (error) {
        console.error(`获取${type === 'hot-searches' ? '热搜榜' : '新闻头条'}数据失败:`, error);
        displayError(type, error);
    }
}
function displayData(type, data) {
    const listElement = document.getElementById(`${type}-list`);
    listElement.innerHTML = '';

    if (!data || data.length === 0) {
        listElement.innerHTML = '<li>暂无数据</li>';
        return;
    }
    // 热搜和新闻都尝试构建链接。如果数据里没有url，就不创建链接
    data.forEach(item => {
        const listItem = document.createElement('li');
        let content;

        if (item.url) { // 优先使用 URL 创建链接
            content = document.createElement('a');
            content.href = item.url;
            content.textContent = item.title;
            content.target = '_blank';
        } else {
             content = document.createTextNode(item.title || item.digest || "没有标题"); //根据情况调整

        }

        listItem.appendChild(content);
        if(type == 'hot-searches' && item.hotnum) {
          const hotnumSpan = document.createElement('span');
          hotnumSpan.textContent = ` (热度: ${item.hotnum})`;
          listItem.appendChild(hotnumSpan)
        }

        listElement.appendChild(listItem);

    });
}

function displayError(type, error) {
    const listElement = document.getElementById(`${type}-list`);
    listElement.innerHTML = `<li>获取数据失败: ${error.message || '未知错误'}</li>`;
}

function checkAndFetchData() {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      // 检查是否到了新的日期，如果是，重置调用计数
    const today = now.toISOString().split('T')[0];
    if (localStorage.getItem('lastUpdateDate') !== today) {
        currentCallCount = 0;
        localStorage.setItem('lastUpdateDate', today);
        localStorage.removeItem('scheduledTimes'); // 移除旧的排期
    }

    // 检查或生成当天的排期时间
    let times = scheduledTimes;
    if(localStorage.getItem('scheduledTimes')){
        try{
          times = JSON.parse(localStorage.getItem('scheduledTimes'))
        }catch(e){
          console.error("解析错误", e)
          times = getRandomTimes();
        }
    }else{
      times = getRandomTimes();
      localStorage.setItem('scheduledTimes', JSON.stringify(times));

    }

    if (times.includes(currentTime) && currentCallCount < 5) {

        currentCallCount++;
        fetchData('hot-searches');
        fetchData('news-headlines');
        //  更新数据后立即存入localstorage
        localStorage.setItem('hotSearchesData', JSON.stringify(hotSearchesData));
        localStorage.setItem('newsHeadlinesData', JSON.stringify(newsHeadlinesData));
    }
}
async function setRandomBackground() {
    try {
        const response = await fetch('https://suijiapi.deno.dev/api/random');
        const imageUrl = await response.text();
        document.body.style.backgroundImage = `url(${imageUrl})`;
    } catch (error) {
        console.error('获取随机背景图片失败:', error);
    }
}

// 初始加载数据
if (localStorage.getItem('hotSearchesData')) {
    try {
        const hotSearches = JSON.parse(localStorage.getItem('hotSearchesData'));
        if (Array.isArray(hotSearches)) {
            displayData('hot-searches', hotSearches);
        }
    } catch (e) {
        console.error("Failed to parse hotSearchesData from localStorage", e);
    }
}
if (localStorage.getItem('newsHeadlinesData')) {
    try {
        const newsHeadlines = JSON.parse(localStorage.getItem('newsHeadlinesData'));
        if (Array.isArray(newsHeadlines)) {
            displayData('news-headlines', newsHeadlines);
        }

    } catch (e) {
        console.error("Failed to parse newsHeadlinesData from localStorage", e);
    }
}
// 页面加载时设置随机背景和获取数据
window.addEventListener('load', () => {
    setRandomBackground();
     checkAndFetchData();
});