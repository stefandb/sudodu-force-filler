<template>
    <div class="flex justify-center items-center mt-4 flex-col">
        <div class="grid grid-cols-3 w-96 max-w-96 min-w-96 border-black border">
            <div v-for="group in 9" :key="'group'+group" class="aspect-square border border-black">
                <div class="grid grid-cols-3">
                    <div v-for="cell in 9" :key="'group'+group+'cell'+cell" class="aspect-square border border-gray-200">
                        <number-input
                            :modelValue="groupValues[group][cell]"
                            :isEditable="isEditable"
                            :guess="groupValueMetadata[group][cell]?.guess"
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

const groupValues = ref({"1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {}, "7": {}, "8": {}, "9": {}})
const groupValueMetadata = ref({1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}})

let rowValues = ref({1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}})
let columnValues = ref({1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}})
let isEditable = ref(true);
let guessCount  = ref(0);
let guesses = []
let guessRetry = null

function setValue(value, group, cell) {
    groupValues.value[group][cell] = value
    if (!groupValueMetadata.value[group][cell]?.guess) {
        groupValueMetadata.value[group][cell] = {guess: false}
    }
}

function increment(value, group, cell) {
    // groupValues.value[group][cell] = value + 3
    console.log(groupValues.value)
    const groupCellRow = Math.ceil(cell / 3)
    const groupCellColumn = cell % 3 === 0 ? 3 : cell % 3
    const groupRow = Math.ceil(group / 3)
    const groupColumn = group % 3 === 0 ? 3 : group % 3
    const gridRow = groupCellRow + ((groupRow - 1) * 3)
    const gridColumn = groupCellColumn + ((groupColumn - 1) * 3)

    //
    // const groupColumnIndex = Math.max(0, (group % 3)) * 3
    // const column = (columnIndex === 0 ? 3 : columnIndex) + groupColumnIndex
    // console.log({
    //     value: value,
    //     group: group,
    //     gridRow: gridRow,
    //     gridColumn: gridColumn
    // });

    rowValues.value[gridRow][gridColumn] = parseInt(value);
    columnValues.value[gridColumn][gridRow] = parseInt(value);
}

function cancel () {
    worker.terminate()
}

function clearField () {
    for (let rowIndex = 1; rowIndex <= 9; rowIndex++) {
        groupValueMetadata.value[rowIndex.toString()] = {}
        groupValues.value[rowIndex.toString()] = {}
    }
}

async function forceFill()
{
    isEditable.value = false

    worker.postMessage(JSON.stringify({values: groupValues.value}))

    worker.onmessage = (message) => {
        console.log()
        console.log(message.data.values)
        for (let rowIndex = 1; rowIndex <= 9; rowIndex++) {
            // console.log(rowIndex, message.data.metaData[rowIndex])
            // console.log(rowIndex, message.data.values[rowIndex])
            groupValueMetadata.value[rowIndex.toString()] = message.data.metaData[rowIndex]
            groupValues.value[rowIndex.toString()] = message.data.values[rowIndex]
        }
        guessCount.value = message.data.guessCount


    }

    // rowLoop: for (let rowIndex = 1; rowIndex <= 9; rowIndex++) {
    //     for (let index = 1; index <= 9; index++) {
    //         if (guessRetry) {
    //             // console.log(rowIndex, index);
    //             // console.log(JSON.parse(JSON.stringify(guesses)));
    //             // console.log(guessRetry);
    //             // console.log(groupValueMetadata.value);
    //         }
    //         let cleanRowIndex = rowIndex;
    //         let rowCount = 0;
    //         let cleanColumnIndex = index;
    //         while (cleanRowIndex > 3) {
    //             cleanRowIndex -= 3
    //             rowCount++
    //         }
    //         while (cleanColumnIndex > 3) {
    //             cleanColumnIndex -= 3
    //         }
    //         const group = Math.ceil(index / 3) + (rowIndex > 3 ? (rowCount * 3) : 0)
    //         const groupCellIndex = cleanColumnIndex + (cleanRowIndex > 1 ?((cleanRowIndex - 1) * 3) : 0)
    //
    //         const guessed = groupValueMetadata.value[group.toString()][groupCellIndex]?.guess
    //         if (guessRetry === rowIndex + '-' + index) {
    //             // console.log(
    //             //     'waarde verhogen met 1 of terug naar vorige',
    //             //     guessRetry,
    //             // );
    //         }
    //         if (!groupValues.value[group.toString()][groupCellIndex]) { // || (guessRetry === rowIndex + '-' + index)
    //             let predictValue = 1
    //             if (guessRetry === rowIndex + '-' + index) {
    //                 predictValue = groupValueMetadata.value[group.toString()][groupCellIndex].lastGuess + 1
    //                 guessRetry = null
    //             }
    //             let horizontalConnectedGroupValues = getGroupCellValues(horizontalConnectedItems(group), horizontalConnectedItems(groupCellIndex));
    //             let verticalConnectedGroupValues = getGroupCellValues(verticalConnectedItems(group), verticalConnectedItems(groupCellIndex));
    //             for (predictValue; predictValue <= 9; predictValue++) {
    //                 if (
    //                     Object.values(horizontalConnectedGroupValues).indexOf(predictValue) === -1 &&
    //                     Object.values(verticalConnectedGroupValues).indexOf(predictValue) === -1 &&
    //                     Object.values(groupValues.value[group.toString()]).indexOf(predictValue) === -1
    //                 ) {
    //                     groupValues.value[group.toString()][groupCellIndex] = predictValue
    //                     groupValueMetadata.value[group.toString()][groupCellIndex] = {guess: true}
    //                     guesses.push({key: rowIndex + '-' + index, group: group.toString(), groupIndex: groupCellIndex, value: predictValue})
    //                     guessRetry = null
    //                     await nextTick()
    //                     break
    //                 }
    //             }
    //             if (!groupValues.value[group.toString()][groupCellIndex]) {
    //                 let newRow = 1;
    //                 let newIndex = 0;
    //
    //                 const latestGuess = guesses.at(-1)
    //                 if (latestGuess) {
    //                     guessRetry = latestGuess.key
    //                     const latestGuessKey = latestGuess.key.split('-')
    //                     guesses = guesses.slice(0, -1)
    //
    //                     groupValueMetadata.value[latestGuess.group][latestGuess.groupIndex] = {
    //                         guess: true,
    //                         lastGuess: latestGuess.value
    //                     }
    //                     delete groupValues.value[latestGuess.group][latestGuess.groupIndex]
    //                     await nextTick()
    //                     // console.log(
    //                     //     latestGuess,
    //                     //     groupValueMetadata.value[latestGuess.group],
    //                     //     groupValues.value[latestGuess.group]
    //                     // )
    //
    //                     newRow = parseInt(latestGuessKey[0]);
    //                     newIndex = parseInt(latestGuessKey[1] - 1)
    //                 } else {
    //                     newRow = 0
    //                     guessRetry = '1-1'
    //                 }
    //                 rowIndex = newRow
    //                 index = newIndex
    //             }
    //             if (guessCount.value === 100000) {
    //                 break rowLoop;
    //             }
    //             guessCount.value++
    //         }
    //     }
    // }
    // console.log('finished');
}

/**
 * bij ophalen verschil maken tussen vaste waardes en voorspelde waardes.
 * Voorspelde waardes worden als vast gezien als het horizontaal link er van staat vertikaal er boven en in de groep een kleinere index heeft.
 * als het aan de andere kant staan moet het worden beschouwd als geen waarde (lege cell)
 * @param groups
 * @param indexes
 * @returns {{}}
 */
function getGroupCellValues(groups, indexes) {
    let values = {}

    let index = 0;
    let groupIndex = 0;
    for (groupIndex in groups) {
        for (index in indexes) {
            values[groups[groupIndex]+ '-' + indexes[index]] = groupValues.value[groups[groupIndex]][indexes[index]]
        }
    }

    return values
}

function horizontalConnectedItems(index) {
    let connectedGroups = [index];

    let horizontalRowGroup = 0;
    while (index > 3) {
        index -= 3
        horizontalRowGroup += 1
    }

    for (let right = index + 1; right <= 3; right++) {
        connectedGroups.push(right + (horizontalRowGroup * 3))
    }
    for (let left = index - 1; left >= 1; left--) {
        connectedGroups.push(left + (horizontalRowGroup * 3))
    }

    return connectedGroups
}

function verticalConnectedItems(index) {
    let connectedGroups = [index];

    let bottom = index + 3
    while (bottom <=9) {
        connectedGroups.push(bottom)
        bottom += 3
    }

    let top = index - 3
    while (top >= 1) {
        connectedGroups.push(top)
        top -= 3
    }

    return connectedGroups;
}

</script>