<template>
    <input
        type="number"
        min="1"
        max="9"
        class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full h-full  text-center text-lg"
        :class="{ 'text-red-700': internalError, 'text-black': !internalError && !guess, 'text-slate-500': !internalError && guess }"
        v-model="inputValue"
        :disabled="!isEditable"
    />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed } from 'vue'

const internalError = ref(false);
const props = defineProps(['modelValue', 'isEditable', 'guess', 'error'])
const inputValue = ref(props.modelValue);
const modelValueComputed = computed(() => props.modelValue)
const emit = defineEmits(['update:modelValue'])

watch(modelValueComputed, (first, second) => {
    inputValue.value = first
});

watch(
    inputValue,
    (newValue) => {
        if ((newValue > 9 || newValue < 1) && newValue !== '') {
            internalError.value = true
        } else {
            internalError.value = false
            emit('update:modelValue', newValue)
        }
    }
)

</script>