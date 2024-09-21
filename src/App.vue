<template>
    <div class="flex justify-center items-center mt-4 flex-col">
        <div class="grid grid-cols-9 w-96 max-w-96 min-w-96 border-black border-4">
            <div
                v-for="(cell, key) in gridValues"
                :key="key"
                class="grid-cell aspect-square border border-gray-100"
                :class="{'border-b-2 border-b-gray-400': cell.row % 3 === 0 && cell.row <= 6}"
            >
                <number-input
                    :modelValue="cell.value"
                    :isEditable="isEditable"
                    :guess="cell.guess"
                    @update:modelValue="$event => cell.value = $event"
                />
            </div>
        </div>


        <div class="mt-4 w-96">
            <button v-show="isEditable" type="button" class="w-1/2 border border-black" @click="forceFill">
                Invullen
            </button>
            <button v-show="!isEditable" type="button" class="w-1/2 border border-black" @click="cancel">
                Cancel {{guessCount}}
            </button>
            <button v-show="isEditable" type="button" class="w-1/2 border border-black" @click="clearField">
                veld legen
            </button>
        </div>
    </div>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import NumberInput from "./Components/NumberInput.vue";
import MyWorker from './Worker?worker'
const worker = new MyWorker()

const gridValues = ref(makeGrid())

let isEditable = ref(true);
let isFinished = ref(false);
let guessCount  = ref(0);

function makeGrid() {
    let grid = {}
    for (let row = 1; row <= 9; row++) {
        for (let column = 1; column <= 9; column++) {
            grid[row + '-' + column] = {
                value: null,
                guess: false,
                column: column,
                row: row
            }
        }
    }
    return grid
}

function setValue(value, group, cell) {
    gridValues.value[group][cell].value = value
}

function cancel () {
    worker.terminate()
}

function clearField () {
    gridValues.value = makeGrid()
}

async function forceFill()
{
    isEditable.value = false
    worker.postMessage(JSON.stringify({gridValues: gridValues.value}))
    worker.onmessage = (message) => {
        for (let row = 1; row <= 9; row++) {
            for (let column = 1; column <= 9; column++) {
                gridValues.value[row + '-' + column] = message.data.gridValues[row + '-' + column]
            }
        }
        isFinished.value = true
        isEditable.value = true
    }
}
</script>

<style scoped>
    .grid-cell:nth-child(3n) {
        @apply border-r-gray-400 border-r-2
    }
    .grid-cell:nth-child(9n) {
        @apply border-r-0
    }
</style>