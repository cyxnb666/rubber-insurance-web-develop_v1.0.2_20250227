<template>
  <div class="data-center" ref="dataCenterRef">
    <div class="header">
      <div class="header-left">
        <span class="title">橡胶交易数据中心</span>
      </div>
      <div class="header-center">
        <div v-for="year in displayYears" :key="year" :class="['year-item', { active: activeYear === year }]"
          @click="activeYear = year">
          {{ year }}
        </div>
      </div>
      <div class="header-right">
        <span class="fullscreen-btn" @click="toggleFullscreen">
          <img :src="isFullscreen ? cancelIcon : fullIcon" :alt="isFullscreen ? 'exit fullscreen' : 'fullscreen'">
        </span>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧区域 - 20%宽度 -->
      <div class="left-section">
        <div class="price-section">
          <div class="section-title">
            <span class="title-text">价格</span>
          </div>
          <div class="section-content">
            <div class="price-info">
              <div class="price-circle">
                <div class="circle-content">
                  <div class="price-text">昨日橡胶期货收盘价格（元）</div>
                  <div class="price-value">{{ yesterdayPrice || '加载中...' }}</div>
                </div>
              </div>
            </div>

            <!-- 交易表格部分 - 2/3 -->
            <div class="trade-info">
              <div class="trade-title">今日成交</div>
              <div class="trade-table">
                <!-- 固定表头 -->
                <table class="fixed-header">
                  <thead>
                    <tr>
                      <th>平台</th>
                      <th>农户</th>
                      <th>品种</th>
                      <th>干胶重量(kg)</th>
                      <th>交易金额(元)</th>
                    </tr>
                  </thead>
                </table>
                <!-- 自动滚动区域 -->
                <div class="scroll-container">
                  <table>
                    <tbody>
                      <!-- 第一份数据 -->
                      <tr v-for="(item, index) in tradeData" :key="index">
                        <td>{{ item.platform }}</td>
                        <td>{{ item.farmer }}</td>
                        <td>{{ item.variety }}</td>
                        <td>{{ item.weight }}</td>
                        <td>{{ item.amount }}</td>
                      </tr>
                      <!-- 复制一份数据以实现无缝滚动 -->
                      <tr v-for="(item, index) in tradeData" :key="'duplicate-' + index">
                        <td>{{ item.platform }}</td>
                        <td>{{ item.farmer }}</td>
                        <td>{{ item.variety }}</td>
                        <td>{{ item.weight }}</td>
                        <td>{{ item.amount }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- 干胶实际交胶量分布部分 -->
        <div class="distribution-section">
          <div class="section-title">
            <span class="title-text">干胶实际交胶量分布</span>
          </div>
          <div class="section-content">
            <RubberDistribution :gb="currentAreaCode" :yearly="activeYear" :areaName="currentAreaName" />
          </div>
        </div>
      </div>

      <!-- 中间区域 - 60%宽度 -->
      <div class="center-section">
        <div class="left-indicators">
          <div class="indicator-item">
            <div class="indicator-icon">
              <img src="@/assets/images/bao.png" alt="承保覆盖率">
            </div>
            <div class="indicator-content">
              <div class="indicator-label">承保覆盖率</div>
              <div class="indicator-value">{{ coverageRate }}</div>
            </div>
          </div>

          <div class="indicator-item">
            <div class="indicator-icon">
              <img src="@/assets/images/trend.png" alt="保障农户数">
            </div>
            <div class="indicator-content">
              <div class="indicator-label">保障农户数</div>
              <div class="indicator-value">{{ farmerCount }}</div>
            </div>
          </div>

          <div class="indicator-item">
            <div class="indicator-icon">
              <img src="@/assets/images/up.png" alt="干胶产量">
            </div>
            <div class="indicator-content">
              <div class="indicator-label">干胶产量</div>
              <div class="indicator-value">{{ dryRubberOutput }}</div>
            </div>
          </div>
        </div>
        <div class="location-selector">
          <div class="location-text">
            <span>当前：{{ currentAreaName }}</span>
            <div class="underline"></div>
          </div>
          <img src="@/assets/images/position.png" class="position-icon" />
        </div>

        <!-- 地图 -->
        <div class="map-wrapper">
          <AMapComponent ref="mapComponentRef" :tdtKey="tdtKey" :yearly="activeYear"
            :getAreaStatistics="getAreaStatistics" @area-selected="handleAreaSelected" />
        </div>
      </div>

      <!-- 右侧区域 - 20%宽度 -->
      <div class="right-section">
        <!-- 理赔数据部分 -->
        <div class="claims-section">
          <div class="section-title">
            <span class="title-text">理赔数据</span>
          </div>
          <div class="section-content">
            <!-- 期间选择器 -->
            <div class="period-selector">
              <div v-for="period in periods" :key="period" :class="['period-tab', { active: activePeriod === period }]"
                @click="activePeriod = period">
                {{ period }}
              </div>
            </div>

            <!-- 理赔数据表格 -->
            <div class="claims-table">
              <table>
                <thead>
                  <tr>
                    <th>服务区域</th>
                    <th>服务保单数</th>
                    <th>服务农户次数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in currentClaimsData" :key="index">
                    <td>{{ item.area }}</td>
                    <td>{{ item.policyCount }}</td>
                    <td>{{ item.serviceCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 周期出险保单累计服务情况部分 -->
        <div class="service-section">
          <div class="section-title">
            <span class="title-text">周期出险保单累计服务情况</span>
          </div>
          <div class="section-content">
            <div class="location">
              <img src="@/assets/images/position.png" alt="location" class="location-icon">
              <span class="location-text">{{ currentTownName || '勐腊镇' }}</span>
            </div>

            <!-- 周期平均交胶量 -->
            <div class="data-block">
              <div class="block-title">周期平均交胶量</div>
              <table>
                <tr>
                  <th>3-5月</th>
                  <th>6-8月</th>
                  <th>9-11月</th>
                </tr>
                <tr>
                  <td>{{ townClaimData.avgGlueWeight35 || '0' }}kg/亩</td>
                  <td>{{ townClaimData.avgGlueWeight68 || '0' }}kg/亩</td>
                  <td>{{ townClaimData.avgGlueWeight911 || '0' }}kg/亩</td>
                </tr>
              </table>
            </div>

            <!-- 预警保单数 -->
            <div class="data-block">
              <div class="block-title">预警保单数</div>
              <table>
                <tr>
                  <th>{{ monthTitles.twoMonthsAgo }}</th>
                  <th>{{ monthTitles.previous }}</th>
                  <th>{{ monthTitles.current }}</th>
                </tr>
                <tr>
                  <td>{{ warnPolicyData.thisMonthBefore2warnPolicyNum }}</td>
                  <td>{{ warnPolicyData.thisMonthBefore1warnPolicyNum }}</td>
                  <td>{{ warnPolicyData.thisMonthwarnPolicyNum }}</td>
                </tr>
              </table>
            </div>

            <!-- 出险保单数 -->
            <!-- <div class="data-block">
              <div class="block-title">出险保单数</div>
              <table>
                <tr>
                  <th>3-5月</th>
                  <th>6-8月</th>
                  <th>9-11月</th>
                </tr>
                <tr>
                  <td>{{ townServiceData.policy35Count }}</td>
                  <td>{{ townServiceData.policy68Count }}</td>
                  <td>{{ townServiceData.policy911Count }}</td>
                </tr>
              </table>
            </div> -->

            <!-- 服务次数 -->
            <!-- <div class="data-block">
              <div class="block-title">服务次数</div>
              <table>
                <tr>
                  <th>3-5月</th>
                  <th>6-8月</th>
                  <th>9-11月</th>
                </tr>
                <tr>
                  <td>{{ townServiceData.service35Count }}</td>
                  <td>{{ townServiceData.service68Count }}</td>
                  <td>{{ townServiceData.service911Count }}</td>
                </tr>
              </table>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RubberDistribution from './components/RubberDistribution.vue';
import AMapComponent from './components/AMapComponent.vue';
import { getYesterdayTurnoverPrice, getTodayTrades, getMapStatistics, getWarnPolicyStatistics, getTownClaimStatistics, getAreaStatistics, getClaimStatistics, getTownServiceStatistics } from './api';
import screenfull from 'screenfull';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const tdtKey = ref('');
const activePeriod = ref('3-5月');
const periods = ['3-5月', '6-8月', '9-11月'];
const baseYear = 2025;
const currentYear = 2025;
const activeYear = ref(currentYear.toString());
const dataCenterRef = ref(null);
const isFullscreen = ref(false);
const fullIcon = new URL('@/assets/images/full.png', import.meta.url).href;
const cancelIcon = new URL('@/assets/images/cancel.png', import.meta.url).href;
const yesterdayPrice = ref('');
const tradeData = ref([]);
const coverageRate = ref(''); // 承保覆盖率
const farmerCount = ref(''); // 保障农户数
const dryRubberOutput = ref(''); // 干胶产量
const currentAreaCode = ref('156530000'); // 当前选中的区域代码，默认为云南省
const currentTown = ref('156532823101'); // 默认的周期出险保单累计服务情况数据
const claimData = ref([]); // 存储理赔数据
const currentSelectedCity = ref('156532800');
const currentAreaName = ref('云南省'); // 当前选中的区域名称
const areaStatisticsData = ref(null);
const mapComponentRef = ref(null);

// 更新数据结构
const townServiceData = ref({
  policy35Count: 0,  // 3-5月出险保单数
  policy68Count: 0,  // 6-8月出险保单数
  policy911Count: 0, // 9-11月出险保单数
  service35Count: 0, // 3-5月服务次数  
  service68Count: 0, // 6-8月服务次数
  service911Count: 0 // 9-11月服务次数
});
const warnPolicyData = ref({
  'period1': 0,  // 3-5月
  'period2': 0,  // 6-8月
  'period3': 0   // 9-11月
});
const currentTownName = ref('');
const townClaimData = ref({
  avgGlueWeight35: '0',
  avgGlueWeight68: '0',
  avgGlueWeight911: '0',
  // 其他理赔相关数据也可以放这里
});
// const fetchTownServiceData = async () => {
//   try {
//     let period = '';
//     const data = await getTownServiceStatistics(currentTown.value, period, parseInt(activeYear.value));
//     if (data) {
//       townServiceData.value = data;
//     }
//   } catch (error) {
//     console.error('获取镇级服务统计数据失败:', error);
//   }
// };
const fetchClaimStatistics = async () => {
  try {
    // 根据当前选中的时期确定period参数
    let period;
    switch (activePeriod.value) {
      case '3-5月':
        period = '35';
        break;
      case '6-8月':
        period = '68';
        break;
      case '9-11月':
        period = '911';
        break;
      default:
        period = '35';
    }

    const data = await getClaimStatistics(
      currentSelectedCity.value,
      period,
      parseInt(activeYear.value)
    );

    if (data && Array.isArray(data)) {
      claimData.value = data.map(item => ({
        area: item.areaname || '-',
        policyCount: item.policyCount || '0',
        serviceCount: item.sumpayeecount || '0'
      }));
    }
  } catch (error) {
    console.error('获取理赔统计数据失败:', error);
  }
};
const fetchAreaStatistics = async () => {
  try {
    const data = await getAreaStatistics(currentAreaCode.value, parseInt(activeYear.value));
    if (data) {
      areaStatisticsData.value = data;
      console.log('区域统计数据:', data);
    } else {
      console.error('获取区域统计数据失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取区域统计数据出错:', error);
  }
};
const fetchTownClaimData = async () => {
  try {
    const data = await getTownClaimStatistics(currentTown.value, parseInt(activeYear.value));
    if (data) {
      townClaimData.value = {
        avgGlueWeight35: data.claim35AvgWeight || '0',
        avgGlueWeight68: data.claim68AvgWeight || '0',
        avgGlueWeight911: data.claim911AvgWeight || '0',
      };
    } else {
      console.error('获取镇级理赔统计数据失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取镇级理赔统计数据出错:', error);
  }
};
const fetchWarnPolicyData = async () => {
  try {
    const data = await getWarnPolicyStatistics(currentTown.value, parseInt(activeYear.value));
    if (data) {
      warnPolicyData.value = {
        thisMonthBefore2warnPolicyNum: data.thisMonthBefore2warnPolicyNum || 0,
        thisMonthBefore1warnPolicyNum: data.thisMonthBefore1warnPolicyNum || 0,
        thisMonthwarnPolicyNum: data.thisMonthwarnPolicyNum || 0
      };
    } else {
      console.error('获取预警保单数据失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取预警保单数据出错:', error);
  }
};
const fetchMapStatistics = async () => {
  try {
    const data = await getMapStatistics(currentAreaCode.value, parseInt(activeYear.value));
    if (data) {
      // 假设返回的数据结构包含这些字段，实际字段名可能需要调整
      coverageRate.value = data.policyRate ? `${data.policyRate}%` : '0%';
      farmerCount.value = data.farmerCount?.toString() || '0';
      dryRubberOutput.value = data.dryWeight ? `${data.dryWeight}kg` : '0kg';
    } else {
      console.error('获取地图统计数据失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取地图统计数据出错:', error);
  }
};
const handleAreaSelected = async (areaInfo) => {
  if (!areaInfo?.gb) {
    console.error('Missing GB code in areaInfo:', areaInfo);
    return;
  }

  currentAreaCode.value = areaInfo.gb;
  currentAreaName.value = areaInfo.name || '未知区域';

  await fetchMapStatistics();

  if (areaInfo.level === 'city') {
    currentSelectedCity.value = areaInfo.gb;
    await fetchClaimStatistics();
  }

  if (areaInfo.level === 'province') {
    await initializeAreaMarkers();
    return;
  }

  if (areaInfo.level === 'town') {
    currentTown.value = areaInfo.gb;
    currentTownName.value = areaInfo.name || '未知区域';
    fetchWarnPolicyData();
    fetchTownClaimData();
    // fetchTownServiceData();
    return;
  }

  try {
    const areaData = await getAreaStatistics(areaInfo.gb, parseInt(activeYear.value));
    if (areaData && mapComponentRef.value) {
      const validAreaData = areaData.filter(item => !!item.gb);
      // 不清除现有标记点
      mapComponentRef.value.addAreaMarkers(validAreaData, false);
    }
  } catch (error) {
    console.error('Error updating area markers:', error);
  }
};
// 初始化区域标记函数
const initializeAreaMarkers = async () => {
    try {
        // 确保组件已挂载
        if (!mapComponentRef.value) {
            console.log('Map component not mounted yet, retrying in 500ms');
            setTimeout(initializeAreaMarkers, 500);
            return;
        }

        // 确保TDT Key已加载
        if (!tdtKey.value) {
            console.log('TDT Key not loaded yet, will retry when key is loaded');
            return;
        }

        // 显式添加加载日志
        console.log('Loading area markers with:', { 
            currentAreaCode: currentAreaCode.value, 
            year: activeYear.value 
        });

        // 获取区域统计数据
        const areaData = await getAreaStatistics(currentAreaCode.value, parseInt(activeYear.value));
        
        if (!areaData || !Array.isArray(areaData)) {
            console.error('Invalid area data returned:', areaData);
            return;
        }

        // 处理和过滤数据
        const processedData = areaData
            .filter(item => !!item.gb)
            .map(item => {
                // 确保每个项都有必要的属性
                return {
                    ...item,
                    periodAvgWeight: item.periodAvgWeight || 0,
                    riskPolicyCount: item.riskPolicyCount || 0
                };
            });

        console.log(`Processed ${processedData.length} valid area data items`);
        
        // 调用地图组件添加标记
        if (mapComponentRef.value && mapComponentRef.value.addAreaMarkers) {
            mapComponentRef.value.addAreaMarkers(processedData);
        } else {
            console.error('Map component method not available');
        }
    } catch (error) {
        console.error('初始化区域标记点失败:', error);
    }
};
watch(activePeriod, async () => {
  await fetchClaimStatistics();
});
watch(activeYear, (newYear) => {
  fetchMapStatistics();
  fetchAreaStatistics();
  fetchClaimStatistics();
  if (currentTown.value) {
    fetchWarnPolicyData();
    fetchTownClaimData(); // 年份变化时，如果已选中乡镇，也需要更新理赔数据
    // fetchTownServiceData();
  }
});
const displayYears = computed(() => {
  const years = [];

  for (let year = baseYear; year <= currentYear; year++) {
    years.push(year.toString());
  }

  return years;
});
const toggleFullscreen = () => {
  if (screenfull.isEnabled && dataCenterRef.value) {
    screenfull.toggle(dataCenterRef.value);
  }
};
// 监听全屏变化
const handleFullscreenChange = () => {
  if (screenfull.isEnabled) {
    isFullscreen.value = screenfull.isFullscreen;
  }
};
const getTdtKey = async () => {
  try {
    const response = await fetch('http://renbao.map-world.com.cn/public/v1/GetKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "Type": "1",
        "UID": "cb7a971a-b425-438e-acce-235070f92289",
        "Time": "",
        "Code": "",
        "Key2": ""
      })
    });

    const data = await response.json();
    if (data.data && data.data.data && data.data.data.key) {
      tdtKey.value = data.data.data.key;
      console.log('获取的Key:', tdtKey.value);
      // 初始化需要Key的组件，如地图
      initComponentsWithKey();
    } else {
      console.error('获取Key失败:', data);
    }
    return data.data.data.key;
  } catch (error) {
    console.error('获取Key出错:', error);
    return null;
  }
};
const fetchYesterdayTurnoverPrice = async () => {
  try {
    const data = await getYesterdayTurnoverPrice();
    if (data) {
      // 假设返回的数据中有一个price字段
      yesterdayPrice.value = formatPrice(data);
    } else {
      console.error('获取昨日收盘价格失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取昨日收盘价格出错:', error);
    yesterdayPrice.value = '获取失败';
  }
};
const formatPrice = (price: number) => {
  return price ? price.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
};
// 获取当前日期及前两个月
const getCurrentAndPreviousMonths = () => {
  const currentDate = new Date(); // 使用当前日期 2025-02-20

  // 获取当前月份和前两个月
  const currentMonth = currentDate.getMonth() + 1; // 获取当前月份 (2)
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1; // 获取上个月 (1)
  const twoMonthsAgo = previousMonth === 1 ? 12 : previousMonth - 1; // 获取前两个月 (12)

  // 计算年份，如果月份是12月且当前不是12月，则年份减1
  const currentYear = currentDate.getFullYear(); // 2025
  const previousMonthYear = previousMonth === 12 && currentMonth !== 12 ? currentYear - 1 : currentYear;
  const twoMonthsAgoYear = twoMonthsAgo === 12 && previousMonth !== 12 ? previousMonthYear - 1 : previousMonthYear;

  return {
    current: { month: currentMonth, year: currentYear },
    previous: { month: previousMonth, year: previousMonthYear },
    twoMonthsAgo: { month: twoMonthsAgo, year: twoMonthsAgoYear }
  };
};
// 格式化月份显示
const formatMonthDisplay = (month, year) => {
  return `${year}.${month}月`;
};
const monthTitles = computed(() => {
  const { current, previous, twoMonthsAgo } = getCurrentAndPreviousMonths();
  return {
    twoMonthsAgo: formatMonthDisplay(twoMonthsAgo.month, twoMonthsAgo.year),
    previous: formatMonthDisplay(previous.month, previous.year),
    current: formatMonthDisplay(current.month, current.year)
  };
});
const initComponentsWithKey = () => {
  // 这里可以初始化地图等需要Key的组件
  // 例如，可以触发子组件的初始化方法或更新props
};
// 组件挂载时添加全局点击事件监听
onMounted(() => {
  const initializeAreaMarkers = async () => {
    const areaData = await getAreaStatistics(currentAreaCode.value, parseInt(activeYear.value));
    if (areaData && tdtKey.value) {
      mapComponentRef.value?.addAreaMarkers(areaData);
    }
  };

  initializeAreaMarkers();
  if (screenfull.isEnabled) {
    screenfull.on('change', handleFullscreenChange);
  }

  // 组件挂载时获取Key
  getTdtKey();

  // 获取昨日橡胶期货收盘价格
  fetchYesterdayTurnoverPrice();

  // 初始获取今日成交数据
  fetchTodayTrades();

  // 初始化区域标记点
  initializeAreaMarkers();

  // 添加初始获取理赔统计数据
  fetchClaimStatistics();

  // 设置轮询，每10秒获取一次今日成交数据
  const tradesPollingInterval = setInterval(() => {
    fetchTodayTrades();
  }, 10 * 1000); // 10秒

  /* 
  // 每2分钟轮询一次今日成交数据
  const tradesPollingInterval = setInterval(() => {
    fetchTodayTrades();
  }, 2 * 60 * 1000); // 2分钟
  */

  // 获取初始地图统计数据
  fetchMapStatistics();

  // 获取初始区域统计数据
  fetchAreaStatistics();

  // 获取初始预警保单数据
  fetchWarnPolicyData();

  // 获取初始镇级理赔统计数据
  fetchTownClaimData();

  // 设置定时器，每小时刷新一次Key
  const keyRefreshInterval = setInterval(() => {
    getTdtKey();
  }, 60 * 60 * 1000); // 1小时

  onUnmounted(() => {
    clearInterval(keyRefreshInterval);
    clearInterval(tradesPollingInterval);
  });
});
// 组件卸载时移除事件监听
onUnmounted(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', handleFullscreenChange);
  }
});
const fetchTodayTrades = async () => {
  try {
    const data = await getTodayTrades();
    if (data && Array.isArray(data)) {
      // 转换API返回的数据格式为组件需要的格式
      tradeData.value = data.map(item => ({
        platform: item.platformName || '-',
        farmer: item.insuredName || '-',
        variety: item.breed === 'FRESH_GLUE' ? '鲜胶' : item.breed === 'MIXED_GLUE' ? '杂胶' : (item.breed || '-'),
        weight: item.dryWeight?.toString() || '0',
        amount: item.tradingPrice?.toString() || '0'
      }));
    } else {
      console.error('获取今日成交数据失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取今日成交数据出错:', error);
  }
};
const currentClaimsData = computed(() => {
  return claimData.value;
});
</script>

<style lang="scss" scoped>
.data-center {
  width: 100%;
  height: 100%;
  min-height: 100%;
  background-color: #081D26;
  display: flex;
  flex-direction: column;

  .header {
    height: 5%;
    background: url('@/assets/images/top_background.png') no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    color: #fff;
    position: relative;

    .header-left {
      .title {
        font-size: 24px;
        font-weight: 500;
        background: linear-gradient(180deg, #FFFFFF 0%, #7CE7FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .header-center {
      display: flex;
      position: absolute;
      left: 28%;
      transform: translateX(-0%);

      .year-item {
        font-size: 16px;
        cursor: pointer;
        padding: 0px 12px;
        position: relative;

        &.active {
          color: #7CE7FF;

          &::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 2px;
            background: #7CE7FF;
          }
        }

        &:hover {
          color: #7CE7FF;
        }
      }
    }

    .header-right {
      margin-left: auto;

      .fullscreen-btn {
        cursor: pointer;

        img {
          width: 24px;
          height: 24px;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    padding: 20px;
    box-sizing: border-box;
    min-height: 0;

    .left-section {
      width: 20%;
      display: flex;
      flex-direction: column;
      gap: 20px;


      .price-section,
      .distribution-section {
        height: calc(50% - 10px);
        background: #03171F;
        border-radius: 4px;
        overflow: hidden;

        .section-title {
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
          padding-left: 10%;
          background-image: url('@/assets/images/title_part.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;

          .title-bg {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            object-fit: fit;
          }

          .title-text {
            position: relative;
            z-index: 1;
            color: #fff;
            font-size: 16px;
            font-weight: 500;
          }
        }

        .section-content {
          height: calc(100% - 40px);

          .price-info {
            height: 33%;

            .price-circle {
              position: relative;
              width: 100%;
              height: 100%;
              background: url('@/assets/images/money_section.png') no-repeat center;
              background-size: contain;

              .circle-content {
                position: absolute;
                left: 60%;
                top: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                width: 100%;
                padding: 0 20px;

                .price-text {
                  font-size: 12px;
                  color: rgba(255, 255, 255, 0.85);
                  margin-bottom: 4px;
                }

                .price-value {
                  font-size: 16px;
                  color: #7CE7FF;
                  font-weight: 500;
                }
              }
            }
          }

          .trade-info {
            height: 66%; // 占据2/3空间
            display: flex;
            flex-direction: column;

            .trade-title {
              color: rgba(255, 255, 255, 0.85);
              font-size: 16px;
              margin-bottom: 10px;
              margin-top: 10px;
              text-align: center; // 居中对齐
              font-weight: bold; // 加粗
            }

            .trade-table {
              flex: 1;
              position: relative;

              .fixed-header {
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse;

                thead {
                  tr {
                    background-color: #03171F;
                  }

                  th {
                    padding: 8px 4px;
                    text-align: center;
                    font-size: 12px;
                    color: #C5D0D4;
                    position: relative;
                  }
                }
              }

              .scroll-container {
                height: 300px;
                overflow: hidden;
              }

              /* 滚动区域内的表格 */
              .scroll-container table {
                width: 100%;
                table-layout: fixed;
                // border-collapse: collapse;
                /* 设置动画：10s 线性无限循环，根据数据量可适当调整 */
                animation: scroll-up 20s linear infinite;
              }

              .scroll-container table:hover {
                animation-play-state: paused;
              }

              /* 表格单元格样式 */
              .scroll-container td {
                padding: 8px 4px;
                text-align: center;
                font-size: 12px;
                color: #7CE7FF;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              }

              @keyframes scroll-up {
                0% {
                  transform: translateY(0);
                }

                100% {
                  transform: translateY(-50%);
                }
              }

              table {
                width: 100%;
                border-collapse: collapse;
                color: rgba(255, 255, 255, 0.85);

                th,
                td {
                  padding: 8px 4px;
                  text-align: center;
                  font-size: 12px;
                }

                th {
                  position: relative; // 添加相对定位
                  color: #C5D0D4;
                  z-index: 1; // 确保文字在渐变背景之上

                  // 使用伪元素的渐变背景
                  &::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(180deg, #45F3FF 0%, rgba(17, 40, 49, 0) 100%);
                    opacity: 0.5;
                    z-index: -1; // 将背景置于文字之下
                  }
                }

                td {
                  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                tbody tr:hover {
                  background: rgba(124, 231, 255, 0.05);
                }

                // 金额列样式
                td:last-child {
                  color: #FFB800;
                }

                // 农户列样式
                td:nth-child(2) {
                  color: #7CE7FF;
                }
              }
            }
          }
        }
      }
    }

    .center-section {
      width: 60%;
      margin: 0 20px;
      position: relative;

      .map-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1; // 确保地图在底层，指标和选择器在上层
      }

      .left-indicators {
        position: absolute;
        // left: 20px;
        // top: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        z-index: 2;
        background-color: rgb(15,24,78);

        .indicator-item {
          display: flex;
          align-items: center;
          gap: 12px;

          .indicator-icon {
            width: 60px; // 增大图标容器尺寸
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
              width: 130px; // 增大图标尺寸
              height: 130px;
            }
          }

          .indicator-content {
            .indicator-label {
              color: #F9FAFA;
              font-size: 14px;
              margin-bottom: 4px;
            }

            .indicator-value {
              color: #FCD63D;
              font-size: 20px;
              font-weight: 500;
            }
          }
        }
      }

      .location-selector {
        position: absolute;
        right: 50px;
        top: 20px;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 6px;

        .location-text {
          position: relative;

          span {
            color: #34FFEA;
            font-size: 16px;
            font-weight: bold;
          }

          .underline {
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 1px;
            background-color: #34FFEA;
          }
        }

        .position-icon {
          width: 16px;
          height: 16px;
        }
      }
    }

    .right-section {
      width: 20%;
      display: flex;
      flex-direction: column;
      gap: 20px;

      .claims-section,
      .service-section {
        flex: 1;
        min-height: 0;
        background: #03171F;
        border-radius: 4px;
        overflow: hidden;

        .section-title {
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
          padding-left: 10%;
          background-image: url('@/assets/images/title_part.png');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;

          .title-text {
            position: relative;
            z-index: 1;
            color: #fff;
            font-size: 16px;
            font-weight: 500;
          }
        }

        .section-content {
          padding: 15px;
          height: calc(100% - 40px);
          overflow-y: auto;

          .period-selector {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;

            .period-tab {
              padding: 6px 12px;
              color: #C5D0D4;
              cursor: pointer;
              font-size: 14px;
              border-radius: 4px;
              transition: all 0.3s;
              position: relative;

              &.active {
                color: #7CE7FF;
                background: rgba(124, 231, 255, 0.1);

                &::after {
                  content: '';
                  position: absolute;
                  bottom: -2px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 20px;
                  height: 2px;
                  background: #7CE7FF;
                }
              }

              &:hover {
                color: #7CE7FF;
                background: rgba(124, 231, 255, 0.05);
              }
            }
          }

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(124, 231, 255, 0.3);
            border-radius: 2px;
          }

          .location {
            display: flex;
            align-items: center;
            margin-bottom: 10px;

            .location-icon {
              width: 20px;
              height: 20px;
              margin-right: 8px;
            }

            .location-text {
              color: #7CE7FF;
              font-size: 16px;
            }
          }

          .data-block {
            margin-bottom: 10px;

            .block-title {
              color: rgba(255, 255, 255, 0.85);
              font-size: 14px;
              margin-bottom: 12px;
              font-weight: 500;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              color: rgba(255, 255, 255, 0.85);

              th {
                padding: 8px 4px;
                text-align: center;
                font-size: 12px;
                position: relative;
                color: #C5D0D4;
                z-index: 1;

                &::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(180deg, #45F3FF 0%, rgba(17, 40, 49, 0) 100%);
                  opacity: 0.5;
                  z-index: -1;
                }
              }

              td {
                padding: 8px 4px;
                text-align: center;
                font-size: 12px;
                color: #7CE7FF;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              }

              tr:hover td {
                background: rgba(124, 231, 255, 0.05);
              }
            }
          }

          .period-title {
            color: rgba(255, 255, 255, 0.85);
            font-size: 16px;
            margin-bottom: 10px;
            text-align: center;
            font-weight: bold;
          }

          .claims-table {
            flex: 1;
            overflow-y: auto;
            margin-top: 12px;
            height: calc(100% - 60px);

            &::-webkit-scrollbar {
              width: 4px;
            }

            &::-webkit-scrollbar-thumb {
              background: rgba(124, 231, 255, 0.3);
              border-radius: 2px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              color: rgba(255, 255, 255, 0.85);

              th,
              td {
                padding: 8px 4px;
                text-align: center;
                font-size: 12px;
              }

              th {
                position: relative;
                color: #C5D0D4;
                z-index: 1;

                &::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(180deg, #45F3FF 0%, rgba(17, 40, 49, 0) 100%);
                  opacity: 0.5;
                  z-index: -1;
                }
              }

              td {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              }

              tbody tr:hover {
                background: rgba(124, 231, 255, 0.05);
              }

              td:nth-child(2),
              td:nth-child(3) {
                color: #7CE7FF;
              }
            }
          }
        }
      }
    }

    .left-section,
    .center-section,
    .right-section {
      border-radius: 4px;
    }
  }
}
</style>