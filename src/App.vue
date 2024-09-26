<template>
    <div class="flex justify-center items-center mt-4 flex-col">
        <div>
            <input type="checkbox" v-model="sudokuX" /> X
        </div>
        ({{ sudokuX }})
        <div class="grid grid-cols-9 w-96 max-w-96 min-w-96 border-black border-4">
            <div
                v-for="(cell, key) in gridValues"
                :key="key"
                class="grid-cell aspect-square border border-gray-100"
                :class="cellBorderClasses(cell)"
            >
                <number-input
                    :modelValue="cell.value"
                    :isEditable="isEditable"
                    :guess="cell.guess"
                    :disabled="!isEditable || cell.guess || isFinished"
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

        {{extraGroups}}
    </div>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import NumberInput from "./Components/NumberInput.vue";
import MyWorker from './Worker?worker'
const worker = new MyWorker()

const gridValues = ref(makeGrid())
const gridConfiguration = ref([
    ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '3-1', '3-2', '3-3'],
    ['1-4', '1-5', '1-6', '2-4', '2-5', '2-6', '3-4', '3-5', '3-6'],
    ['1-7', '1-8', '1-9', '2-7', '2-8', '2-9', '3-7', '3-8', '3-9'],
    ['4-1', '4-2', '4-3', '5-1', '5-2', '5-3', '6-1', '6-2', '6-3'],
    ['4-4', '4-5', '4-6', '5-4', '5-5', '5-6', '6-4', '6-5', '6-6'],
    ['4-7', '4-8', '4-9', '5-7', '5-8', '5-9', '6-7', '6-8', '6-9'],
    ['7-1', '7-2', '7-3', '8-1', '8-2', '8-3', '9-1', '9-2', '9-3'],
    ['7-4', '7-5', '7-6', '8-4', '8-5', '8-6', '9-4', '9-5', '9-6'],
    ['7-7', '7-8', '7-9', '8-7', '8-8', '8-9', '9-7', '9-8', '9-9'],
])

let isEditable = ref(true);
let isFinished = ref(false);
let sudokuX = ref(false);
let guessCount = ref(0);
let extraGroups = ref([
    ['1-1', '2-2', '3-3', '4-4', '5-5', '6-6', '7-7', '8-8', '9-9'],
    ['1-9', '2-8', '3-7', '4-6', '5-5', '6-4', '7-3', '8-2', '9-1']
])
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

function cellBorderClasses(cell) {
    let classes = []
    if (cell.row <= 9 && cell.column <= 9) {
        const groupCells = gridConfiguration.value.find(row => row.includes(cell.row + '-' + cell.column))
        if (groupCells.indexOf(cell.row + '-' + (cell.column + 1)) === -1 && cell.column < 9) {
            classes.push('border-r-blue-400')
            for (let i = groupCells.length - 1; i >= 0; i--) {
                const groupCell = groupCells[i];
                
            }
        }

        if (groupCells.indexOf(cell.row + '-' + (cell.column - 1)) === -1 && cell.column > 1) {
            classes.push('border-l-blue-400')
        }

        if (groupCells.indexOf((cell.row + 1) + '-' + (cell.column)) === -1 && cell.row < 9) {
            classes.push('border-b-blue-400')
        }

        if (groupCells.indexOf((cell.row - 1) + '-' + (cell.column)) === -1 && cell.row > 1) {
            classes.push('border-t-blue-400')
        }

        if (cell.row === 1) {
            classes.push('border-t-blue-400')
        }
        if (cell.row === 9) {
            classes.push('border-b-blue-400')
        }

        if (cell.column === 1) {
            classes.push('border-l-blue-400')
        }
        if (cell.column === 9) {
            classes.push('border-r-blue-400')
        }

        if (
            sudokuX.value &&
            (
                extraGroups.value[0].indexOf(cell.row + '-' + cell.column) > -1 ||
                extraGroups.value[1].indexOf(cell.row + '-' + cell.column) > -1
            )
        ) {
            classes.push('bg-green-300')
        }
    }
    return classes;
}

function setValue(value, group, cell) {
    gridValues.value[group][cell].value = value
}

function cancel () {
    worker.terminate()
}

function clearField () {
    gridValues.value = makeGrid()
    isFinished.value = false
    isEditable.value = true
}

async function forceFill()
{
    isEditable.value = false
    worker.postMessage(
        JSON.stringify({
            gridValues: gridValues.value,
            configuration: {
                grid: gridConfiguration.value,
                sudokuX: sudokuX.value
            }
        })
    )
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