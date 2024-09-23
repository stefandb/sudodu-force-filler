let xModesGroups = [
    ['1-1', '2-2', '3-3', '4-4', '5-5', '6-6', '7-7', '8-8', '9-9'],
    ['1-9', '2-8', '3-7', '4-6', '5-5', '6-4', '7-3', '8-2', '9-1']
]

onmessage = (event) => {
    const data = JSON.parse(event.data)
    let gridValues = data.gridValues
    console.log(data, gridValues)
    let guesses = []
    let guessRetry = null
    let guessCount  = 0;

    rowLoop: for (let row = 1; row <= 9; row++) {
        for (let column = 1; column <= 9; column++) {
            let cleanRowIndex = row;
            let rowCount = 0;
            let cleanColumnIndex = column;
            while (cleanRowIndex > 3) {
                cleanRowIndex -= 3
                rowCount++
            }
            while (cleanColumnIndex > 3) {
                cleanColumnIndex -= 3
            }

            if (!gridValues[row + '-' + column].value) {
                let predictValue = 1
                if (guessRetry === row + '-' + column) {
                    predictValue = gridValues[row + '-' + column].lastGuess + 1
                    guessRetry = null
                }
                for (predictValue; predictValue <= 9; predictValue++) {
                    if (
                        Object.values(getGroupCellValues([row], [1,2,3,4,5,6,7,8,9], gridValues)).indexOf(predictValue) === -1 &&
                        Object.values(getGroupCellValues([1,2,3,4,5,6,7,8,9], [column], gridValues)).indexOf(predictValue) === -1 &&
                        Object.values(getGroupCellValues(groupRows(row), groupRows(column), gridValues)).indexOf(predictValue) === -1 &&
                        (
                            data.config.xModes && valueInXModus(row, column, predictValue, gridValues) || !data.config.xModes
                        )
                    ) {
                        gridValues[row + '-' + column].value = predictValue
                        gridValues[row + '-' + column].guess = true
                        guesses.push({key: row + '-' + column, value: predictValue}) //group: group.toString(), groupIndex: groupCellIndex,
                        guessRetry = null
                        break
                    }
                }
                if (!gridValues[row + '-' + column].value) {
                    let newRow = 1;
                    let newColumn = 0;

                    const latestGuess = guesses.at(-1)
                    if (latestGuess) {
                        guessRetry = latestGuess.key
                        const latestGuessKey = latestGuess.key.split('-')
                        guesses = guesses.slice(0, -1)

                        gridValues[guessRetry].lastGuess = latestGuess.value
                        gridValues[guessRetry].value = null
                        gridValues[guessRetry].guess = true

                        newRow = parseInt(latestGuessKey[0]);
                        if (latestGuessKey[1] === 1 && latestGuessKey[0] > 1) {
                            newColumn = 8
                            newRow--
                        } else {
                            newColumn = parseInt(latestGuessKey[1]) - 1
                        }
                    } else {
                        newRow = 0
                        guessRetry = '1-1'
                    }
                    row = newRow
                    column = newColumn
                }
                if (guessCount === 5000000) {
                    break rowLoop;
                }
                guessCount++
            }
        }
    }
    postMessage({gridValues: gridValues, guessCount: guessCount})
}

function getGroupCellValues(rows, columns, gridValues) {
    let values = {}

    rows.forEach(function (row) {
        columns.forEach(function (column) {
            values[row + '-' + column] =  gridValues[row + '-' + column].value
        })
    })

    return values
}

function groupRows(row) {
    let cleanRowIndex = row;
    let rowCount = 0;
    while (cleanRowIndex > 3) {
        cleanRowIndex -= 3
        rowCount++
    }

    let connectedRows = [row];

    for (let bottom = cleanRowIndex + 1; bottom <= 3; bottom++) {
        connectedRows.push(bottom + (rowCount * 3))
    }
    for (let top = cleanRowIndex - 1; top >= 1; top--) {
        connectedRows.push(top + (rowCount * 3))
    }
    return connectedRows
}

function valueInXModus(row, column, predictValue, gridValues){
    let found = false;
    const key = row + '-' + column
    if (xModesGroups[0].indexOf(key) > -1) {
        xModesGroups[0].forEach(function (key) {
            const keyInfo = key.split('-')
            if (!found) {
                found = Object.values(getGroupCellValues([keyInfo[0]], [keyInfo[1]], gridValues)).indexOf(predictValue) > -1
            }
        })
    }
    if (xModesGroups[1].indexOf(key) > -1 && !found) {
        xModesGroups[1].forEach(function (key) {
            const keyInfo = key.split('-')
            if (!found) {
                found = Object.values(getGroupCellValues([keyInfo[0]], [keyInfo[1]], gridValues)).indexOf(predictValue) > -1
            }
        })
    }
    return !found
}