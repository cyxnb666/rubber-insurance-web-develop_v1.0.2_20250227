<template>
    <a-modal :open="open" :title="isEdit ? '修改基础参数配置' : '基础参数配置'" @cancel="handleCancel" @ok="handleOk"
        :maskClosable="false" :width="600">
        <template #footer>
            <a-button key="back" @click="handleCancel">取消</a-button>
            <a-button key="submit" type="primary" :loading="loading" @click="handleOk">确定</a-button>
        </template>
        <a-form ref="formRef" :model="formState" :rules="rules" label-align="right" :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }">
            <a-form-item label="年度" name="yearly">
                <a-date-picker v-model:value="formState.yearly" style="width: 100%" picker="year"
                    :disabled-date="disabledDate" value-format="YYYY" placeholder="请选择年度" />
            </a-form-item>

            <a-form-item label="费率%" name="feeRate">
                <a-input-number v-model:value="formState.feeRate" placeholder="请输入正数，支持2位小数" :min="0" :max="100"
                    :precision="2" style="width: 100%" />
            </a-form-item>

            <a-form-item label="保额(元)" name="amount">
                <a-input-number v-model:value="formState.amount" placeholder="请输入正数，支持2位小数" :min="0" :precision="2"
                    style="width: 100%" />
            </a-form-item>

            <a-form-item label="目标价格(元/kg)" name="targetPrice">
                <a-input-number v-model:value="formState.targetPrice" placeholder="请输入正数，支持2位小数" :min="0" :precision="2"
                    style="width: 100%" />
            </a-form-item>

            <a-form-item label="目标交胶量(kg/亩)" name="targetYield">
                <a-input-number v-model:value="formState.targetYield" placeholder="请输入正数，支持2位小数" :min="0" :precision="2"
                    style="width: 100%" />
            </a-form-item>

            <a-form-item label="最低交胶量(kg/亩)" name="targetMinYield">
                <a-input-number v-model:value="formState.targetMinYield" placeholder="请输入正数，支持2位小数" :min="0"
                    :precision="2" style="width: 100%" />
            </a-form-item>

            <a-form-item label="杂干折算系数" name="convertCoefficient">
                <a-input-number v-model:value="formState.convertCoefficient" placeholder="请输入正数，支持2位小数" :min="0"
                    :precision="2" style="width: 100%" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { saveClaimConfig } from '../api';
import { message } from 'ant-design-vue';
import moment from 'moment';

const props = defineProps<{
    open: boolean;
    isEdit: boolean;
    record?: any;
}>();

const emit = defineEmits(['update:open', 'success']);
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);

const formState = reactive({
    yearly: undefined,
    feeRate: undefined,
    amount: undefined,
    targetPrice: undefined,
    targetYield: undefined,
    targetMinYield: undefined,
    convertCoefficient: undefined,
});

const disabledDate = (current: moment.Moment) => {
    return current && (current.year() < 2025 || current.year() > 2050);
};

const rules = {
    yearly: [{ required: true, message: '请选择年度' }],
    feeRate: [{ required: true, message: '请输入费率' }],
    amount: [{ required: true, message: '请输入保费' }],
    targetPrice: [{ required: true, message: '请输入目标价格' }],
    targetYield: [{ required: true, message: '请输入目标交胶量' }],
    targetMinYield: [{ required: true, message: '请输入最低交胶量' }],
    convertCoefficient: [{ required: true, message: '请输入杂干折算系数' }],
};

const resetFormState = () => {
    Object.assign(formState, {
        yearly: undefined,
        feeRate: undefined,
        amount: undefined,
        targetPrice: undefined,
        targetYield: undefined,
        targetMinYield: undefined,
        convertCoefficient: undefined,
    });
};

watch(
    () => props.record,
    (val) => {
        if (val && props.isEdit) {
            Object.keys(formState).forEach(key => {
                if (key === 'yearly') {
                    formState[key] = val[key]?.toString();
                } else {
                    formState[key] = val[key];
                }
            });
        } else {
            resetFormState();
        }
    },
    { immediate: true }
);

watch(
    () => props.open,
    (val) => {
        if (!val) {
            formRef.value?.resetFields();
            resetFormState();
        }
    }
);

const handleOk = () => {
    loading.value = true;
    formRef.value?.validate()
        .then(() => {
            const params = {
                ...formState,
                yearly: Number(formState.yearly),
                createTime: '',
                configId: props.isEdit ? props.record.configId : undefined
            };
            return saveClaimConfig(params);
        })
        .then(() => {
            message.success('保存成功');
            emit('success', true);
            emit('update:open', false);
        })
        .catch(error => {
            console.error('保存失败:', error);
            message.error('保存失败');
        })
        .finally(() => {
            loading.value = false;
        });
};

const handleCancel = () => {
    emit('update:open', false);
};
</script>

<style lang="scss" scoped>
:deep(.ant-modal-body) {
    padding: 24px 24px 0;
}
</style>