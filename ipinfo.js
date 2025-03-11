async function fetchIpInfo(api, elementId) {
    let url, options, apiKey;

    switch (api) {
        case 'ipinfo':
            apiKey = import.meta.env.VITE_IPINFO_TOKEN; // 从环境变量获取
            url = `https://ipinfo.io/json?token=${apiKey}`;
            options = { method: 'GET' };
            break;
        case 'ipapi':
            apiKey = import.meta.env.VITE_IPAPI_IS_KEY; // 从环境变量获取
            url = 'https://api.ipapi.is';
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ips: [], key: apiKey })
            };
            break;
        case 'ip2location':
            apiKey = import.meta.env.VITE_IP2LOCATION_KEY;  // 从环境变量获取
            url = `https://api.ip2location.io/?key=${apiKey}`;
            options = { method: 'GET' };
            break;
        default:
            console.error("未知的 API:", api);
            return;
    }
      if (!apiKey) {
        console.error(`未设置 ${api} 的 API 密钥`);
        return; // 如果没有 API 密钥，直接返回
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayIpInfo(data, elementId);
    } catch (error) {
        console.error(`获取 ${api} 数据失败:`, error);
        displayIpInfoError(error, elementId);
    }
}

function displayIpInfo(data, elementId) {
    const element = document.getElementById(elementId);
    let formattedData = '';

    if (elementId === 'ip2location-data') {
        formattedData = `
            IP: ${data.ip || 'N/A'}\n
            国家: ${data.country_name || 'N/A'}\n
            地区: ${data.region_name || 'N/A'}\n
            城市: ${data.city_name || 'N/A'}\n
            经度: ${data.longitude || 'N/A'}\n
            纬度: ${data.latitude || 'N/A'}\n
            时区: ${data.time_zone || 'N/A'}\n
            ASN: ${data.asn || 'N/A'}
        `;
    } else if (elementId === 'ipinfo-data') {
        formattedData = `
            IP: ${data.ip || 'N/A'}\n
            城市: ${data.city || 'N/A'}\n
            地区: ${data.region || 'N/A'}\n
            国家: ${data.country || 'N/A'}\n
            经纬度: ${data.loc || 'N/A'}\n
            组织: ${data.org || 'N/A'}\n
            邮编: ${data.postal || 'N/A'}\n
            时区: ${data.timezone || 'N/A'}\n
        `;
    } else if (elementId === 'ipapi-data') {
        formattedData = `
            IP: ${data.ip || 'N/A'}\n
            是否移动网络: ${data.is_mobile ? '是' : '否'}\n
            国家: ${data.location?.country || 'N/A'}\n
            地区: ${data.location?.state || 'N/A'}\n
            城市: ${data.location?.city || 'N/A'}\n
            经度: ${data.location?.longitude || 'N/A'}\n
            纬度: ${data.location?.latitude || 'N/A'}\n
            时区: ${data.location?.timezone || 'N/A'}\n
            ASN: ${data.asn?.asn || 'N/A'}\n
            组织: ${data.company?.name || 'N/A'}
        `;
    }

    element.textContent = formattedData;
}
function displayIpInfoError(error, elementId) {
    const element = document.getElementById(elementId);
    element.textContent = `获取数据失败: ${error.message || '未知错误'}`;
}
fetchIpInfo('ipinfo', 'ipinfo-data');
fetchIpInfo('ipapi', 'ipapi-data');
fetchIpInfo('ip2location', 'ip2location-data');