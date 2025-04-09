<template>
    <div class="map-container" ref="mapContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits, defineExpose } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cloneDeep } from 'lodash';
const emit = defineEmits(['area-selected']);
const props = defineProps<{
    tdtKey: string
    yearly: string,
    getAreaStatistics: Function
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: any = null;
const yunnanGBCode = '156530000'; // 云南省行政区划代码
let currentLevel = 'province'; // 当前显示的行政级别：province, city, county, town
let currentCityCode = ''; // 当前选中的市级代码
let currentCountyCode = ''; // 当前选中的县级代码
let cityLayers: Record<string, any> = {}; // 存储市级图层
let countyLayers: Record<string, any> = {}; // 存储县级图层
let townLayers: Record<string, any> = {}; // 存储乡镇级图层
let initialLabels: L.Marker[] = []; // 存储初始加载的标签（省和市级）
let interactionLabels: L.Marker[] = []; // 存储交互后添加的标签（县和乡镇级）
let provinceLayer: any = null; // 存储省级图层
let initialZoomLevel = 7; // 初始缩放级别
let markers: L.Marker[] = []; // 存储所有标记点
let areaDataCache = {}; // 用于缓存每个区域的数据
const mapInitialized = ref(false);
const pendingAreaData = ref(null);
// 行政区划颜色定义
const areaColors = {
    province: {
        stroke: '#FF5733',
        fill: '#FF5733',
        fillOpacity: 0.05,
        weight: 12
    },
    city: {
        stroke: '#33A8FF',
        fill: '#33A8FF',
        fillOpacity: 0.1,
        weight: 4
    },
    county: {
        stroke: '#9D33FF',
        fill: '#9D33FF',
        fillOpacity: 0.15,
        weight: 3
    },
    town: {
        stroke: '#33FF57',
        fill: '#33FF57',
        fillOpacity: 0.2,
        weight: 2
    }
};

// 监听tdtKey变化
watch(() => props.tdtKey, (newKey) => {
    if (newKey && mapContainer.value && !map) {
        initMap(newKey);
    } else if (newKey && map) {
        updateMapLayers(newKey);
    }
}, { immediate: true });

function initMap(key: string) {
    if (!mapContainer.value) return;

    try {
        // 创建Leaflet地图
        map = L.map(mapContainer.value, {
            center: [25.04, 102.71], // 云南昆明中心坐标
            zoom: initialZoomLevel,
            zoomControl: false, // 禁用默认缩放控件，后面会自定义位置
            attributionControl: false
        });

        // 在右上角添加缩放控件
        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        // 添加图层
        addMapLayers(key);

        // 添加云南省边界并显示下级市
        drawProvinceAndCities(key);

        // 添加缩放事件监听器
        setupZoomListener();
    } catch (error) {
        console.error('地图初始化失败:', error);
    }
    mapInitialized.value = true;
}
function setupZoomListener() {
    if (!map) return;

    let previousZoom = map.getZoom();

    map.on('zoomend', async function () {
        const currentZoom = map.getZoom();

        // 当缩放级别小于等于初始级别且用户正在缩小地图时，重置到初始状态
        if (currentZoom < previousZoom &&
            currentZoom <= initialZoomLevel &&
            currentLevel !== 'province') {
            // 重置状态
            await resetToInitialState();

            // 重新获取并显示初始标记点
            try {
                const areaData = await props.getAreaStatistics(yunnanGBCode, parseInt(props.yearly));
                if (areaData) {
                    const validAreaData = areaData.filter(item => !!item.gb);
                    addAreaMarkers(validAreaData, true);
                }
            } catch (error) {
                console.error('Error restoring initial markers:', error);
            }

            // 直接使用初始视图的中心点和缩放级别
            map.setView([25.04, 102.71], initialZoomLevel);
        }

        previousZoom = currentZoom;
    });
}
async function resetToInitialState() {
    // 清除所有交互后添加的图层和标签
    hideCounties();
    hideTowns();

    // 清除现有的标记点
    markers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    markers = [];

    // 重置状态变量
    currentLevel = 'province';
    currentCityCode = '';
    currentCountyCode = '';

    // 关闭可能的弹窗
    map.closePopup();

    // 触发area-selected事件,通知父组件当前选中云南省
    emit('area-selected', {
        gb: yunnanGBCode,
        name: '云南省',
        level: 'province'
    });
}
function clearInteractionLabels() {
    // 从地图中移除所有交互标签
    interactionLabels.forEach(label => {
        if (map.hasLayer(label)) {
            map.removeLayer(label);
        }
    });

    // 重置交互标签数组
    interactionLabels = [];
}

// function addMapLayers(key: string) {
//     if (!map) return;

//     try {
//         // 使用墨卡托投影的矢量地图
//         const vecBaseLayer = L.tileLayer(`http://renbao.map-world.com.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tdtkey=${key}`, {
//             maxZoom: 18,
//             minZoom: 3
//         });

//         // 添加矢量注记图层
//         const vecNoteLayer = L.tileLayer(`http://renbao.map-world.com.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tdtkey=${key}`, {
//             maxZoom: 18,
//             minZoom: 3
//         });

//         // 将图层添加到地图
//         vecBaseLayer.addTo(map);
//         vecNoteLayer.addTo(map);
//     } catch (error) {
//         console.error('添加图层失败:', error);
//     }
// }
function addMapLayers(key: string) {
    if (!map) return;

    try {
        // 使用墨卡托投影的影像地图
        const imgBaseLayer = L.tileLayer(`http://renbao.map-world.com.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tdtkey=${key}`, {
            maxZoom: 18,
            minZoom: 3
        });

        // 添加影像注记图层
        // const imgNoteLayer = L.tileLayer(`http://renbao.map-world.com.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tdtkey=${key}`, {
        //     maxZoom: 18,
        //     minZoom: 3
        // });

        // 将图层添加到地图
        imgBaseLayer.addTo(map);
        // imgNoteLayer.addTo(map);
    } catch (error) {
        console.error('添加图层失败:', error);
    }
}

async function drawProvinceAndCities(key: string) {
    try {
        // 1. 获取并绘制云南省边界
        provinceLayer = await fetchAndDrawBoundary(yunnanGBCode, 'province', key, true);
        if (provinceLayer) {
            provinceLayer.on('click', function (e) {
                // 发射事件，传递区域信息
                emit('area-selected', {
                    gb: yunnanGBCode,
                    name: '云南省',
                    level: 'province'
                });
            });
        }

        // 2. 获取云南省下属的市级行政区划
        const cities = await fetchSubDivisions(yunnanGBCode, key);
        if (cities && cities.length > 0) {
            // 3. 绘制各市边界
            await drawCities(cities, key);
        }
    } catch (error) {
        console.error('绘制省市边界失败:', error);
        // 使用默认视图
        map.setView([25.04, 102.71], initialZoomLevel);
    }
}

async function fetchSubDivisions(gbCode: string, key: string) {
    try {
        const response = await fetch(`http://renbao.map-world.com.cn/api/region/division/getByPgb?gb=${gbCode}&tdtkey=${key}`);
        const data = await response.json();

        if (data.status === 200 && data.data && Array.isArray(data.data)) {
            return data.data;
        } else {
            console.error('获取下级行政区划失败', data);
            return [];
        }
    } catch (error) {
        console.error('请求下级行政区划出错:', error);
        return [];
    }
}

async function drawCities(cities: any[], key: string) {
    // 清空现有的市级图层
    Object.values(cityLayers).forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    cityLayers = {};

    // 绘制每个市的边界
    for (const city of cities) {
        const cityLayer = await fetchAndDrawBoundary(city.gb, 'city', key, true);
        if (cityLayer) {
            // 存储图层并添加点击事件
            cityLayers[city.gb] = cityLayer;

            // 添加点击事件
            cityLayer.on('click', async function (e) {
                // 阻止事件冒泡，避免触发地图的点击事件
                L.DomEvent.stopPropagation(e);

                emit('area-selected', {
                    gb: city.gb,
                    name: city.name,
                    level: 'city'
                });

                // 如果已经显示了这个市的县级区划，则隐藏
                if (currentLevel === 'county' && currentCityCode === city.gb) {
                    hideCounties();
                    currentLevel = 'city';
                    currentCityCode = '';
                } else {
                    // 否则显示这个市的县级区划
                    await showCounties(city.gb, key);
                    currentLevel = 'county';
                    currentCityCode = city.gb;
                }
            });

            // 将市级边界添加到地图
            cityLayer.addTo(map);
        }
    }
}

// 显示县级区划函数
async function showCounties(cityGbCode: string, key: string) {
    try {
        // 清空现有的县级和乡镇级图层
        hideCounties();
        hideTowns();

        // 获取市下属的县级行政区划
        const counties = await fetchSubDivisions(cityGbCode, key);

        // 获取并缓存县级数据
        const areaData = await props.getAreaStatistics(cityGbCode, parseInt(props.yearly));
        if (areaData && Array.isArray(areaData)) {
            areaData.forEach(item => {
                if (item.gb) {
                    areaDataCache[item.gb] = item;
                }
            });
        }

        if (counties && counties.length > 0) {
            // 绘制每个县的边界
            for (const county of counties) {
                const countyLayer = await fetchAndDrawBoundary(county.gb, 'county', key, false);
                if (countyLayer) {
                    countyLayers[county.gb] = countyLayer;

                    countyLayer.on('click', async function (e) {
                        // 阻止事件冒泡
                        L.DomEvent.stopPropagation(e);

                        emit('area-selected', {
                            gb: county.gb,
                            name: county.name,
                            level: 'county'
                        });

                        if (currentLevel === 'town' && currentCountyCode === county.gb) {
                            hideTowns();
                            currentLevel = 'county';
                            currentCountyCode = '';
                            showCountyPopup(county, e.latlng);
                        } else {
                            await showTowns(county.gb, key);
                            currentLevel = 'town';
                            currentCountyCode = county.gb;
                        }
                    });

                    countyLayer.addTo(map);
                }
            }
            // 根据当前选择的市调整地图视图
            zoomToCity(cityGbCode);
        }
    } catch (error) {
        console.error('显示县级区划失败:', error);
    }
}


// 显示乡镇级区划函数
async function showTowns(countyGbCode: string, key: string) {
    try {
        // 清空现有的乡镇级图层
        hideTowns();

        // 获取县下属的乡镇级行政区划
        const towns = await fetchSubDivisions(countyGbCode, key);

        // 获取并缓存乡镇数据
        const areaData = await props.getAreaStatistics(countyGbCode, parseInt(props.yearly));
        if (areaData && Array.isArray(areaData)) {
            areaData.forEach(item => {
                if (item.gb) {
                    areaDataCache[item.gb] = item;
                }
            });
        }

        if (towns && towns.length > 0) {
            // 绘制每个乡镇的边界
            for (const town of towns) {
                const townLayer = await fetchAndDrawBoundary(town.gb, 'town', key, false);
                if (townLayer) {
                    townLayers[town.gb] = townLayer;

                    townLayer.on('click', function (e) {
                        // 阻止事件冒泡
                        L.DomEvent.stopPropagation(e);

                        emit('area-selected', {
                            gb: town.gb,
                            name: town.name,
                            level: 'town'
                        });

                        // 从缓存中获取数据
                        const cachedData = areaDataCache[town.gb] || {};

                        // 显示乡镇级弹窗，使用缓存数据
                        showTownPopup(
                            {
                                ...town,
                                periodAvgWeight: cachedData.periodAvgWeight,
                                riskPolicyCount: cachedData.riskPolicyCount
                            },
                            e.latlng
                        );
                    });

                    townLayer.addTo(map);
                }
            }
            // 根据当前选择的县调整地图视图
            zoomToCounty(countyGbCode);
        } else {
            // 如果没有下级行政区，显示提示
            const county = await fetchBoundaryInfo(countyGbCode, key);
            if (county) {
                const center = [county.lat, county.lng];
                L.popup()
                    .setLatLng(center)
                    .setContent(
                        `<div class="area-popup"><h3>${county.name}</h3><p>当前行政区域无下级数据</p></div>`
                    )
                    .openOn(map);
            }
        }
    } catch (error) {
        console.error('显示乡镇级区划失败:', error);
    }
}


async function fetchBoundaryInfo(gbCode: string, key: string) {
    try {
        const response = await fetch(`http://renbao.map-world.com.cn/api/region/division/getByGb?gb=${gbCode}&tdtkey=${key}`);
        const data = await response.json();

        if (data.status === 200 && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('获取边界信息失败:', error);
        return null;
    }
}

function showCountyPopup(county: any, latlng: L.LatLng) {
    L.popup()
        .setLatLng(latlng)
        .setContent(`<div class="area-popup"><h3>${county.name}</h3><p>行政代码: ${county.gb}</p><p>点击可查看下级行政区</p></div>`)
        .openOn(map);
}

// 乡镇弹窗函数，直接使用传入的数据
function showTownPopup(town: any, latlng: L.LatLng) {
    console.log('Showing data:', town);

    L.popup()
        .setLatLng(latlng)
        .setContent(`
      <div class="area-popup">
        <h4>${town.name}</h4>
        <p class="small-text">行政代码: ${town.gb}</p>
        <div class="town-data">
          <div class="data-item small-text">
            <span class="label">周期平均交胶量:</span>
            <span class="value">${town.periodAvgWeight || 0}kg/亩</span>
          </div>
          ${(town.riskPolicyCount > 0) ? `
          <div class="data-item small-text">
            <span class="label">预警保单数:</span>
            <span class="value">${town.riskPolicyCount}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `)
        .openOn(map);
}

function hideCounties() {
    // 移除县级边界图层
    Object.values(countyLayers).forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    countyLayers = {};

    // 同时隐藏乡镇级图层
    hideTowns();

    // 清除交互产生的标签
    clearInteractionLabels();
}

function hideTowns() {
    // 移除乡镇级边界图层
    Object.values(townLayers).forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    townLayers = {};
}

function zoomToCity(cityGbCode: string) {
    const cityLayer = cityLayers[cityGbCode];
    if (cityLayer && cityLayer.getBounds) {
        map.fitBounds(cityLayer.getBounds(), {
            padding: [20, 20]
        });
    }
}

function zoomToCounty(countyGbCode: string) {
    const countyLayer = countyLayers[countyGbCode];
    if (countyLayer && countyLayer.getBounds) {
        map.fitBounds(countyLayer.getBounds(), {
            padding: [20, 20]
        });
    }
}

async function fetchAndDrawBoundary(gbCode: string, level: 'province' | 'city' | 'county' | 'town', key: string, isInitial: boolean) {
    try {
        const response = await fetch(`http://renbao.map-world.com.cn/api/region/division/getByGb?gb=${gbCode}&tdtkey=${key}`);
        const data = await response.json();

        if (data.status === 200 && data.data) {
            // 获取WKT格式的多边形数据
            const wktStr = data.data.shape;
            if (!wktStr) {
                console.error(`${level}边界数据为空`);
                return null;
            }

            // 解析WKT格式的MULTIPOLYGON字符串
            const coordinates = parseWKTMultiPolygon(wktStr);
            if (coordinates.length === 0) {
                console.error(`解析${level}边界坐标失败`);
                return null;
            }

            // 创建GeoJSON多边形
            const geoJsonPolygons = coordinates.map(polygon => {
                return {
                    type: "Polygon",
                    coordinates: polygon
                };
            });

            const multiPolygon = {
                type: "MultiPolygon",
                coordinates: coordinates
            };

            // 使用适当的颜色样式
            const style = {
                color: areaColors[level].stroke,
                weight: areaColors[level].weight,
                opacity: 0.8,
                fillColor: areaColors[level].fill,
                fillOpacity: areaColors[level].fillOpacity
            };

            // 创建GeoJSON图层
            const layer = L.geoJSON({
                type: "Feature",
                properties: {
                    name: data.data.name,
                    gb: gbCode,
                    level: level
                },
                geometry: multiPolygon
            }, {
                style: style
            });

            // 添加名称标签，只给省市县添加标签，乡镇级别太多，不添加
            // 标签添加的判断条件，移除对行政级别的限制
            if (level === 'city' || level === 'county' || level === 'town') { // 添加town级别
                const center = [data.data.lat, data.data.lng];
                var iconAnchor = [50, 10];
                if(data.data.gb == '156530400') {
                  iconAnchor = [10, 10]
                } else if(data.data.name .length < 4) {
                  iconAnchor = [20, 10]
                } else if(data.data.gb == '156532800' || data.data.gb == '156532500') {
                  iconAnchor = [65, 10];
                } else if( data.data.gb == '156533400') {
                  iconAnchor = [75, 10];
                }
                const areaLabel = L.marker(center, {
                  icon: L.divIcon({
                    className: `area-label ${level}-label`,
                    html: `<div >${data.data.name}</div>`,
                    iconSize: [100, 20],
                    iconAnchor: iconAnchor
                  })
                });

                areaLabel.addTo(map);

                // 根据是否是初始加载，将标签存储到不同的数组中
                if (isInitial) {
                  initialLabels.push(areaLabel);
                } else {
                  interactionLabels.push(areaLabel);
                }

            }

            return layer;
        } else {
            console.error(`获取${level}边界数据失败`, data);
            return null;
        }
    } catch (error) {
        console.error(`处理${level}边界失败:`, error);
        return null;
    }
}

// 解析WKT格式的MULTIPOLYGON字符串
function parseWKTMultiPolygon(wktString: string) {
    // 移除 MULTIPOLYGON 和首尾括号
    let coordsText = wktString.replace(/^MULTIPOLYGON\s*\(\(/, '').replace(/\)\)$/, '');

    // 分割多边形
    let polygonsText = coordsText.split(/\)\s*,\s*\(/);
    let multiPolygon = [];

    for (let polygonText of polygonsText) {
        let polygon = [];

        // 处理单个多边形的坐标
        let ringsText = polygonText.split(/\)\s*,\s*\(/);
        for (let ringText of ringsText) {
            let ring = [];
            let coordPairs = ringText.split(/,\s*/);

            for (let coordPair of coordPairs) {
                let [lon, lat] = coordPair.trim().split(/\s+/).map(parseFloat);
                if (!isNaN(lon) && !isNaN(lat)) {
                    ring.push([lon, lat]);
                }
            }

            if (ring.length > 0) {
                polygon.push(ring);
            }
        }

        if (polygon.length > 0) {
            multiPolygon.push(polygon);
        }
    }

    return multiPolygon;
}

function updateMapLayers(key: string) {
    if (!map) return;

    try {
        // 清除现有基础图层
        map.eachLayer((layer: any) => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        // 清除所有标签和边界图层
        initialLabels.forEach(label => {
            if (map.hasLayer(label)) map.removeLayer(label);
        });
        interactionLabels.forEach(label => {
            if (map.hasLayer(label)) map.removeLayer(label);
        });

        if (provinceLayer && map.hasLayer(provinceLayer)) {
            map.removeLayer(provinceLayer);
        }

        Object.values(cityLayers).forEach(layer => {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });
        Object.values(countyLayers).forEach(layer => {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });
        Object.values(townLayers).forEach(layer => {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });

        // 重置状态
        initialLabels = [];
        interactionLabels = [];
        cityLayers = {};
        countyLayers = {};
        townLayers = {};
        provinceLayer = null;
        currentLevel = 'province';
        currentCityCode = '';
        currentCountyCode = '';

        // 添加新图层
        addMapLayers(key);

        // 重新加载省市边界
        drawProvinceAndCities(key);
    } catch (error) {
        console.error('更新图层失败:', error);
    }
}
function preprocessAreaData(areaData) {
    if (!areaData || !Array.isArray(areaData)) {
        return [];
    }
    
    return areaData.map(area => {
        // 确保必要属性存在
        if (!area) return null;
        
        // 复制数据并添加必要属性
        return {
            ...area,
            periodAvgWeight: area.periodAvgWeight !== undefined ? area.periodAvgWeight : 0,
            riskPolicyCount: area.riskPolicyCount !== undefined ? area.riskPolicyCount : 0,
            level: getLevelFromGBCode(area.gb)
        };
    }).filter(item => item !== null);
}
function addAreaMarkers(areaData: any[], shouldClearExisting: boolean = true) {
    const processedData = preprocessAreaData(areaData);

    if (processedData.length === 0) {
        console.log('No valid area data to display');
        return;
    }

    console.log(`Adding ${processedData.length} markers, data sample:`, processedData[0]);
    // 如果数据为空，直接返回
    if (!areaData || areaData.length === 0) {
        console.log('No valid area data provided');
        return;
    }

    // 保存传入的数据
    pendingAreaData.value = {
        data: areaData,
        shouldClear: shouldClearExisting
    };
    
    if (map && mapInitialized.value) {
        renderPendingMarkers();
    }

    // 检查地图是否已完全初始化
    if (!map || !mapInitialized.value) {
        console.log('Map not initialized, will render markers when ready');
        return;
    }

    // 实际渲染标记的函数
    renderPendingMarkers();
}
async function processMarkersQueue(queue) {
    console.log(`Processing ${queue.length} markers in queue`);
    
    // 暂时清空当前标记以确保重新渲染
    markers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    markers = [];

    // 获取每个区域的详细信息并创建标记
    for (const area of queue) {
        try {
            const areaInfo = await fetchBoundaryInfo(area.gb, props.tdtKey);
            if (!areaInfo) {
                console.error('Failed to fetch boundary info for GB:', area.gb);
                continue;
            }

            // 存储获取到的区域信息
            const areaLevel = getLevelFromGBCode(area.gb);
            const center = [areaInfo.lat - 0.02, areaInfo.lng];
            
            // 直接根据数据内容判断颜色，不依赖全局状态
            let color = '#FFF000'; // 较亮的黄色
            
            console.log(`Processing marker: GB=${area.gb}, Name=${areaInfo.name}, Level=${areaLevel}`);
            console.log(`Data: periodAvgWeight=${area.periodAvgWeight}, riskPolicyCount=${area.riskPolicyCount}`);
            
            // 对乡镇级数据特殊处理
            if (areaLevel === 'town') {
                if (area.periodAvgWeight !== undefined && area.riskPolicyCount > 0) {
                    color = '#FF0000';
                    console.log(`Set RED marker for ${areaInfo.name} - has risk policies`);
                } else {
                    console.log(`Set YELLOW marker for ${areaInfo.name} - no risk policies or missing data`);
                }
            }

            // 创建自定义倒三角形图标
            const triangleIcon = L.divIcon({
                className: 'custom-triangle-marker',
                html: `<div style="
                    width: 0; 
                    height: 0; 
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 15px solid ${color};
                    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
                "></div>`,
                iconSize: [20, 15],
                iconAnchor: [10, 15]
            });

            // 创建标记
            const marker = L.marker(center, { icon: triangleIcon });
            
            // 设置点击事件
            marker.on('click', async () => {
                handleMarkerClick(area, areaInfo, center);
            });

            // 添加到地图
            marker.addTo(map);
            markers.push(marker);

        } catch (error) {
            console.error('处理标记失败:', error, 'Area:', area);
        }
    }
    
    // 标记处理完成
    pendingAreaData.value = null;
    console.log(`Finished adding ${markers.length} markers to map`);
}

// 处理标记点击事件
function handleMarkerClick(area, areaInfo, center) {
    if (!area.gb || !areaInfo.name) {
        console.error('Missing required data for marker click');
        return;
    }

    const areaLevel = getLevelFromGBCode(area.gb);
    console.log(`Marker clicked: ${areaInfo.name}, Level: ${areaLevel}`);

    // 发送选中事件
    emit('area-selected', {
        gb: area.gb,
        name: areaInfo.name,
        level: areaLevel,
        data: area
    });

    // 对乡镇级标记点显示弹窗
    if (areaLevel === 'town') {
        const cachedData = areaDataCache[area.gb] || {};
        showTownPopup(
            {
                name: areaInfo.name,
                gb: area.gb,
                periodAvgWeight: cachedData.periodAvgWeight || area.periodAvgWeight,
                riskPolicyCount: cachedData.riskPolicyCount || area.riskPolicyCount
            },
            L.latLng(center[0], center[1])
        );
    }
}

// 根据GB代码判断行政级别
function getLevelFromGBCode(gbCode) {
    if (!gbCode) return 'unknown';
    
    // 根据GB代码长度或格式判断级别
    // 这里是示例逻辑，需要根据实际GB代码规则调整
    const strCode = gbCode.toString();
    
    if (strCode.length === 9 && strCode.endsWith('0000')) {
        return 'province';
    } else if (strCode.length === 9 && strCode.endsWith('00')) {
        return 'city';
    } else if (strCode.length === 9) {
        return 'county';
    } else if (strCode.length > 9) {
        return 'town';
    }
    
    return 'unknown';
}
// 新增函数：实际渲染标记
function renderPendingMarkers() {
    // 确保有待处理的数据
    if (!pendingAreaData.value) {
        return;
    }

    const { data: areaData, shouldClear } = pendingAreaData.value;
    console.log(`Rendering ${areaData.length} markers, shouldClear: ${shouldClear}`);
    
    // 清除现有标记点（如果需要）
    if (shouldClear) {
        markers.forEach(marker => {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        });
        markers = [];
    }

    // 所有标记的处理队列
    const markersQueue = [];
    
    // 处理每个区域数据
    areaData.forEach(area => {
        if (!area.gb) {
            console.error('Area GB code is missing:', area);
            return;
        }
        
        // 深度克隆数据，避免引用问题
        const areaClone = cloneDeep(area);
        markersQueue.push(areaClone);
    });
    
    // 一次性处理所有标记
    processMarkersQueue(markersQueue);
}

// 添加地图点击事件，点击空白处时返回上层
function setupMapClickEvent() {
    if (!map) return;

    map.on('click', () => {
        if (currentLevel === 'town') {
            // 如果当前是乡镇级视图，返回到县级视图
            hideTowns();
            currentLevel = 'county';
            currentCountyCode = '';
        } else if (currentLevel === 'county') {
            // 如果当前是县级视图，返回到市级视图
            hideCounties();
            currentLevel = 'city';
            currentCityCode = '';
        } else if (currentLevel === 'city') {
            // 如果当前是市级视图，维持当前视图
            // 这里不做操作，保持市级视图
        }
    });
}

defineExpose({
    addAreaMarkers
});

onMounted(() => {
    if (props.tdtKey && props.tdtKey.length > 0) {
        initMap(props.tdtKey);
        setupMapClickEvent();
    }
});

watch(mapInitialized, (isInitialized) => {
    if (isInitialized && pendingAreaData.value) {
        console.log('Map initialized, rendering pending markers');
        renderPendingMarkers();
    }
});

onUnmounted(() => {
    // 清理资源
    if (map) {
        try {
            map.remove();
            map = null;
        } catch (error) {
            console.error('清理地图资源失败:', error);
        }
    }
});
</script>

<style lang="scss" scoped>
.map-container {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    background-color: #03171F;
}

:deep(.leaflet-control-attribution) {
    display: none !important;
}

:deep(.leaflet-control-zoom) {
    border: none;
    margin-right: 10px;
    margin-top: 10px;

    a {
        background-color: rgba(8, 29, 38, 0.7) !important;
        color: #45F3FF !important;
        border: 1px solid #45F3FF !important;

        &:hover {
            background-color: rgba(8, 29, 38, 0.9) !important;
        }
    }
}

:deep(.area-label) {
    background: transparent;
    border: none;
    pointer-events: none;

    div {
        color: #fff;
        text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
        white-space: nowrap;
        font-weight: bold;
    }
}

:deep(.province-label div) {
    font-size: 16px;
    color: #ffffff;
    text-shadow: -2px -2px 0 rgba(116, 72, 146), 2px -2px 0 rgba(116, 72, 146), -2px 2px 0 rgba(116, 72, 146), 2px 2px 0 rgba(116, 72, 146);
}

:deep(.city-label div) {
    font-size: 14px;
    color: #ffffff;
    text-shadow: -2px -2px 0 rgba(116, 72, 146), 2px -2px 0 rgba(116, 72, 146), -2px 2px 0 rgba(116, 72, 146), 2px 2px 0 rgba(116, 72, 146);
}

:deep(.county-label div) {
    font-size: 12px;
    color: #ffffff;
    text-shadow: -2px -2px 0 rgba(116, 72, 146), 2px -2px 0 rgba(116, 72, 146), -2px 2px 0 rgba(116, 72, 146), 2px 2px 0 rgba(116, 72, 146);
}

:deep(.leaflet-popup-content-wrapper) {
    background: rgba(8, 29, 38, 0.8);
    color: #7CE7FF;
    border: 1px solid #45F3FF;
    border-radius: 4px;
}

:deep(.leaflet-popup-tip) {
    background: rgba(8, 29, 38, 0.8);
    border: 1px solid #45F3FF;
}

:deep(.town-label div) {
    font-size: 11px;
    color: #ffffff;
    text-shadow: -2px -2px 0 rgba(116, 72, 146), 2px -2px 0 rgba(116, 72, 146), -2px 2px 0 rgba(116, 72, 146), 2px 2px 0 rgba(116, 72, 146);
}

:deep(.area-popup) {
    h4 {
        color: #45F3FF;
        margin: 0 0 5px 0;
        font-size: 14px;
    }

    .small-text {
        font-size: 12px;
        margin: 0;
    }

    .town-data {
        margin-top: 8px;
        border-top: 1px solid rgba(124, 231, 255, 0.3);
        padding-top: 6px;

        .data-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;

            .label {
                color: #C5D0D4;
            }

            .value {
                color: #FCD63D;
                font-weight: bold;
            }
        }
    }
}
</style>