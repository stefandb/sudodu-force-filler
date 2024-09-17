onmessage = (event) => {
    console.log(111111);
    let inputValues = JSON.parse(event.data).values
    console.log(inputValues);
    const groupValueMetadata = {1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}}
    let guesses = []
    let guessRetry = null
    let guessCount  = 0;

    rowLoop: for (let rowIndex = 1; rowIndex <= 9; rowIndex++) {
        for (let index = 1; index <= 9; index++) {
            let cleanRowIndex = rowIndex;
            let rowCount = 0;
            let cleanColumnIndex = index;
            while (cleanRowIndex > 3) {
                cleanRowIndex -= 3
                rowCount++
            }
            while (cleanColumnIndex > 3) {
                cleanColumnIndex -= 3
            }
            const group = Math.ceil(index / 3) + (rowIndex > 3 ? (rowCount * 3) : 0)
            const groupCellIndex = cleanColumnIndex + (cleanRowIndex > 1 ?((cleanRowIndex - 1) * 3) : 0)

            if (!inputValues[group.toString()][groupCellIndex]) { // || (guessRetry === rowIndex + '-' + index)
                let predictValue = 1
                if (guessRetry === rowIndex + '-' + index) {
                    predictValue = groupValueMetadata[group.toString()][groupCellIndex].lastGuess + 1
                    guessRetry = null
                }
                let horizontalConnectedGroupValues = getGroupCellValues(horizontalConnectedItems(group), horizontalConnectedItems(groupCellIndex), inputValues);
                let verticalConnectedGroupValues = getGroupCellValues(verticalConnectedItems(group), verticalConnectedItems(groupCellIndex), inputValues);
                for (predictValue; predictValue <= 9; predictValue++) {
                    if (
                        Object.values(horizontalConnectedGroupValues).indexOf(predictValue) === -1 &&
                        Object.values(verticalConnectedGroupValues).indexOf(predictValue) === -1 &&
                        Object.values(inputValues[group.toString()]).indexOf(predictValue) === -1
                    ) {
                        inputValues[group.toString()][groupCellIndex] = predictValue
                        groupValueMetadata[group.toString()][groupCellIndex] = {guess: true}
                        guesses.push({key: rowIndex + '-' + index, group: group.toString(), groupIndex: groupCellIndex, value: predictValue})
                        guessRetry = null
                        break
                    }
                }
                if (!inputValues[group.toString()][groupCellIndex]) {
                    let newRow = 1;
                    let newIndex = 0;

                    const latestGuess = guesses.at(-1)
                    if (latestGuess) {
                        guessRetry = latestGuess.key
                        const latestGuessKey = latestGuess.key.split('-')
                        guesses = guesses.slice(0, -1)

                        groupValueMetadata[latestGuess.group][latestGuess.groupIndex] = {
                            guess: true,
                            lastGuess: latestGuess.value
                        }
                        delete inputValues[latestGuess.group][latestGuess.groupIndex]
                        newRow = parseInt(latestGuessKey[0]);
                        newIndex = parseInt(latestGuessKey[1]) - 1
                    } else {
                        newRow = 0
                        guessRetry = '1-1'
                    }
                    rowIndex = newRow
                    index = newIndex
                }
                if (guessCount === 5000000) {
                    break rowLoop;
                }
                guessCount++

                if (guessCount % 1000 === 0) {
                    console.log(guessCount + ' pogingen')
                }
            }
        }
    }

    postMessage({values: inputValues, metaData: groupValueMetadata, guessCount: guessCount})
}

function getGroupCellValues(groups, indexes, inputValues) {
    let values = {}

    let index = 0;
    let groupIndex = 0;
    for (groupIndex in groups) {
        for (index in indexes) {
            values[groups[groupIndex]+ '-' + indexes[index]] = inputValues[groups[groupIndex]][indexes[index]]
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
