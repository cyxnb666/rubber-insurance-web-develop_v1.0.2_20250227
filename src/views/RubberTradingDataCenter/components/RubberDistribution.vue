<template>
    <div class="rubber-distribution" ref="chartRef">
        <div class="area-title">
            <img src="@/assets/images/position.png" alt="position" class="position-icon" />
            <span>{{ props.areaName }}</span>
        </div>
        <div id="distributionChart" style="width: 100%; height: calc(100% - 20px);"></div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onMounted, onUnmounted, ref, watch, defineProps } from 'vue';
import screenfull from 'screenfull';
import { getDryWeightStatistics } from '../api';

const props = defineProps({
    gb: {
        type: String,
        default: '156530000'
    },
    yearly: {
        type: String,
        default: '2025'
    },
    areaName: {
        type: String,
        default: '云南省'
    }
});

const chartRef = ref(null);
let chart: echarts.ECharts | null = null;
const chartData = ref({
    dryRubber: Array(9).fill(0)
});

// 监听areaCode和yearly变化，重新获取数据
watch(
    [() => props.gb, () => props.yearly],
    async () => {
        await fetchDryWeightData();
        if (chart) {
            updateChartData();
        }
    }
);

const fetchDryWeightData = async () => {
    try {
        const data = await getDryWeightStatistics(props.gb, parseInt(props.yearly));
        if (data && Array.isArray(data)) {
            // 初始化9个月的数据为0(3-11月)
            const dryRubberData = Array(9).fill(0);

            // 填充有数据的月份
            data.forEach(item => {
                const month = parseInt(item.tradeMonth);
                // 只处理3-11月的数据
                if (month >= 3 && month <= 11) {
                    dryRubberData[month - 3] = item.dryWeight || 0; // 索引从0开始,所以要减了3
                }
            });

            chartData.value = {
                dryRubber: dryRubberData
            };
        } else {
            console.error('获取干胶分布数据失败，返回数据格式不正确');
        }
    } catch (error) {
        console.error('获取干胶分布数据出错:', error);
    }
};

const updateChartData = () => {
    if (!chart) return;

    const option = chart.getOption();
    option.series[0].data = chartData.value.dryRubber;
    chart.setOption(option);
};

const initChart = () => {
    const chartDom = document.getElementById('distributionChart');
    if (!chartDom) return;

    chart = echarts.init(chartDom);

    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(8, 29, 38, 0.8)',
            borderColor: '#7CE7FF',
            textStyle: {
                color: '#fff'
            },
            formatter: function (params: any) {
                let result = `${params[0].axisValue}<br/>`;
                result += `${params[0].seriesName}: ${params[0].value}kg<br/>`;
                return result;
            }
        },
        legend: {
            data: ['干胶'],
            right: '4%',
            top: '-3px',
            textStyle: {
                color: '#C5D0D4',
                fontSize: 12
            },
            itemWidth: 12,
            itemHeight: 5,
            icon: 'rect',
            selectedMode: true
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '20%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月'],
            axisLine: {
                lineStyle: {
                    color: '#C5D0D4'
                }
            },
            axisLabel: {
                color: '#C5D0D4'
            }
        },
        yAxis: {
            type: 'value',
            name: '(kg)',
            nameTextStyle: {
                color: '#C5D0D4'
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(197, 208, 212, 0.1)'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#C5D0D4'
                }
            },
            axisLabel: {
                color: '#C5D0D4'
            }
        },
        series: [
            {
                name: '干胶',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                data: chartData.value.dryRubber,
                itemStyle: {
                    color: '#7CE7FF'
                },
                lineStyle: {
                    color: '#7CE7FF',
                    width: 2
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(124, 231, 255, 0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(124, 231, 255, 0)'
                        }
                    ])
                }
            }
        ]
    };

    chart.setOption(option);
};

const handleResize = () => {
    if (chart) {
        chart.resize();
    }
};

const handleFullscreenChange = () => {
    setTimeout(() => {
        handleResize();
    }, 100);
};

onMounted(async () => {
    await fetchDryWeightData();
    initChart();
    window.addEventListener('resize', handleResize);
    if (screenfull.isEnabled) {
        screenfull.on('change', handleFullscreenChange);
    }
});


onUnmounted(() => {
    chart?.dispose();
    window.removeEventListener('resize', handleResize);
    if (screenfull.isEnabled) {
        screenfull.off('change', handleFullscreenChange);
    }
});
</script>

<style lang="scss" scoped>
.rubber-distribution {
    width: 100%;
    height: 100%;
    position: relative;
}

.area-title {
    position: absolute;
    top: -5px;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 5px 10px;
}

.position-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

.area-title span {
    color: #7CE7FF;
    font-size: 14px;
    font-weight: 500;
}

#distributionChart {
    margin-top: 20px;
}
</style>