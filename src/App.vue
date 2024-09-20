<template>
    <div class="flex justify-center items-center mt-4 flex-col">
        <div class="grid grid-cols-3 w-96 max-w-96 min-w-96 border-black border">
            <div v-for="group in 9" :key="'group'+group" class="aspect-square border border-black">
                <div class="grid grid-cols-3">
                    <div v-for="cell in 9" :key="'group'+group+'cell'+cell" class="aspect-square border border-gray-200">
                        <number-input
                            :modelValue="gridValues[group][cell].value"
                            :isEditable="isEditable"
                            :guess="gridValues[group][cell].guess"
                            @update:modelValue="$event => setValue($event, group, cell)"
                        />
                    </div>
                </div>
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
    for (let group = 1; group <= 9; group++) {
        grid[group.toString()] = {}
        for (let cell = 1; cell <= 9; cell++) {
            grid[group.toString()][cell] = {
                value: null,
                guess: false,
                lastGuess: null,

                group: group.toString(),
                groupIndex: cell
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
        for (let rowIndex = 1; rowIndex <= 9; rowIndex++) {
            gridValues.value[rowIndex.toString()] = message.data.gridValues[rowIndex]
        }
        guessCount.value = message.data.guessCount
        isFinished.value = true
        isEditable.value = true
    }
}
</script>