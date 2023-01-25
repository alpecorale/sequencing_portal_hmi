import * as barcodeKit from '/barcodeKits.js'

export class CustomKit { // Custom

    miSeqTableHeadersOg = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project']
    miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project', 'Reference']

    sampleSheetToPass = new FormData();
    miSeqDynamicFile

    defaultReads = [151, 151]

    indexKits = [
        {
            "id": "Custom",
            "text": "Custom",
            "kit": barcodeKit.customIndexKit
        },
        {
            "id": "Mission Bio",
            "text": "Mission Bio",
            "kit": barcodeKit.missionBioIndexKit
        }
    ]

    validReadTypes = 'both' // 'single', 'paired'



    // make SampleSheet
    makeMiseqSampleSheet(samplesList, metaData, callback) {

        let csvSampleSheetMiSeq = ''
        
        // make header/settings/reads etc
        csvSampleSheetMiSeq += this.#makeHeader(metaData)

        csvSampleSheetMiSeq += "\n[Data]\n"

        if (metaData.readType === 'paired') {
            // add header names
            csvSampleSheetMiSeq += this.miSeqTableHeadersOg.join(',') + "\n" // want og headers

            // add samples
            samplesList.forEach((x) => {
                // slice to get original rows
                x = x.slice(0, 8)
                csvSampleSheetMiSeq += x.join(',') + "\n"

            })

        } else { // single end
            
        }

        // })
        let fileName = metaData.miseqExpName + '_' + metaData.date.split('-').join('_') + '_SampleSheet.csv'
        let csvSampleSheetMiSeqData = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });

        // need to grab this later
        this.sampleSheetToPass.append('file', new File([csvSampleSheetMiSeqData], fileName))

        // // old way of downloading sample sheet directly to user
        let csvUrl = URL.createObjectURL(csvSampleSheetMiSeqData);
        let hiddenElement = document.createElement('a');
        hiddenElement.href = csvUrl;
        hiddenElement.target = '_blank';
        hiddenElement.download = fileName; // edit this to properly name the sample sheet
        hiddenElement.click();

        callback(true)
    }

    // make dynamic SampleSheet
    makeDynamicSampleSheet(samplesList, metaData, callback) {

        let csvSampleSheetMiSeq = ''
        
        // make header/settings/reads etc
        csvSampleSheetMiSeq += this.#makeHeader(metaData)

        csvSampleSheetMiSeq += "\n[Data]\n"

        // add header names
        csvSampleSheetMiSeq += this.miSeqTableHeaders.join(',') + "\n" // want all headers

        // add samples
        samplesList.forEach((x) => {
            // want all info
            csvSampleSheetMiSeq += x.join(',') + "\n"
        })


        let fileName = metaData.miseqExpName + '_' + metaData.date.split('-').join('_') + '_Additional_Info.csv'
        let csvDataDynamic = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });

        this.miSeqDynamicFile = new File([csvDataDynamic], fileName)

        callback(true)
    }
    
    #makeHeader(metaData) {
        let csvSampleSheetMiSeq = ''
        csvSampleSheetMiSeq += '[Header]\n';
        csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + metaData.lrmaId + '\n'
        csvSampleSheetMiSeq += "Experiment Name," + metaData.miseqExpName + '\n'
        csvSampleSheetMiSeq += "Date," + metaData.date + '\n'
        csvSampleSheetMiSeq += "Module," + metaData.module + '\n'
        csvSampleSheetMiSeq += "Workflow," + metaData.workflow + '\n'
        csvSampleSheetMiSeq += "Library Prep Kit," + metaData.libPrepKit + '\n'
        csvSampleSheetMiSeq += "Index Kit," + metaData.indexKit + '\n'
        csvSampleSheetMiSeq += "Chemistry," + metaData.chemistry + '\n'
        csvSampleSheetMiSeq += "\n[Reads]\n"
        csvSampleSheetMiSeq += metaData.reads1 + '\n'
        csvSampleSheetMiSeq += metaData.reads2 + '\n'
        csvSampleSheetMiSeq += "\n[Settings]\n"
        return csvSampleSheetMiSeq
    }
    // Get Samples ERRORS code
    getSamplesErrors(samples, metaData, callback) {
        
        let internalErrors = false

        let i7andi5Pairs = []
        let allSampleIds = []
        // let allSampleNames = []

        if (samples.length < 1) {
            alert('Please add samples', 'danger')
            internalErrors = true
            return;
        }

        // check sample errors here
        samples.forEach((x, i) => {

            // convert - and ' ' to _
            x[0] = x[0].split('-').join('_')
            x[0] = x[0].split(' ').join('_')
            x[1] = x[1].split('-').join('_')
            x[1] = x[1].split(' ').join('_')
            x[7] = x[7].split('-').join('_')
            x[7] = x[7].split(' ').join('_')


            if (!x[0]) {
                alert('Missing Sample_ID in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (!x[3]) {
                alert('Missing I7 Index in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (!x[5]) {
                alert('Missing I5 Index in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (x[3].length != 8 || x[5].length != 8) {
                alert('I5 or I7 Index length is incorrect length for Sample ' + (i + 1), 'danger')
                internalErrors = true;
            }


            // make sure i5 and i7 index are not the same
            if (x[3] === x[5] && x[3] && x[5]) {
                alert('I5 and I7 Index in Sample ' + (i + 1) + ' cannot be the same', 'danger')
                internalErrors = true
            }

            // add I7 and I5 pair to list
            i7andi5Pairs.push({ 'i7': x[3], 'i5': x[5] })


            // add all sample Ids/Names to list
            allSampleIds.push(x[0])

            // // check for references in sample sheet being none/empty
            // if (x[8] === 'None' || x[8] === '') {
            //     // add alert and stop here if desired
            //     // internalErrors = true
            // }

        })

        // check that all I7 and I5 pairs are unique
        i7andi5Pairs.forEach((x, xi) => {
            i7andi5Pairs.forEach((y, yi) => {
                // skip checked pairs
                if (xi >= yi) { return; }
                // compare each pair to see if any matches
                if (_.isEqual(x, y)) {
                    alert('I5_I7 Pair is repeated in Samples ' + (xi + 1) + ' and ' + (yi + 1), 'danger')
                    internalErrors = true
                }
            })
        })


        // check that all I7 and I5 pairs are from same barcoding kit (group)
        i7andi5Pairs.forEach((x, xi) => {
            let i7Kit = ''
            let i5Kit = ''

            // this can be done a lot better with lodash.contains probably
            // or litterly any other way to see inside objects
            i7BarcodeKits.results.forEach((y, yi) => {
                if (i7Kit !== '') { return } // already found
                if (yi === 0) { return } // skip none value
                // a .contains would be nice here
                y.children.forEach(z => {
                    if (i7Kit !== '') { return }
                    if (z.id === x.i7) {
                        i7Kit = y.text
                    }
                })
            })

            i5BarcodeKits.results.forEach((y, yi) => {
                if (i5Kit !== '') { return } // already found
                if (yi === 0) { return } // skip none value
                // a .contains would be nice here
                y.children.forEach(z => {
                    if (i5Kit !== '') { return }
                    if (z.id === x.i5) {
                        i5Kit = y.text
                    }
                })
            })

            if (i5Kit !== i7Kit) {
                alert('I7 & I5 Barcodes in Sample ' + (xi + 1) + ' do not come from the same barcoding kit ', 'danger')
                internalErrors = true
            }

        })
        // check that all sample_Ids and names are unique
        if (allSampleIds.length !== _.uniq(allSampleIds).length) {
            alert('Please make sure all sample Ids are unique', 'danger')
            internalErrors = true
        }

        callback(internalErrors)
    }

}

export class TruSeqKit { // TruSeq Stranded mRNA

    truSeqTableHeadersOg = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'Sample_Project', 'Lane', 'Index_Plate_Well']
    miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project', 'Reference']

    sampleSheetToPass = new FormData();
    miSeqDynamicFile

    defaultReads = [76, 76]

    indexKits = [
        {
            "id": "TruSeq Single Index Set A",
            "text": "TruSeq Single Index Set A",
            "kit": barcodeKit.truSeqSingleIndexSetAKit
        },
        {
            "id": "TruSeq Single Index Set B",
            "text": "TruSeq Single Index Set B",
            "kit": barcodeKit.truSeqSingleIndexSetBKit
        },
        {
            "id": "TruSeq Single Index Set A B",
            "text": "TruSeq Single Index Set A B",
            "kit": barcodeKit.truSeqSingleIndexSetABKit
        }
    ]

    validReadTypes = 'single'

    // might set adapters here rather then leave them as inputs


    // make SampleSheet
    makeMiseqSampleSheet(samplesList, metaData, callback) {

        let csvSampleSheetMiSeq = ''
        
        // make header/settings/reads etc
        csvSampleSheetMiSeq += this.#makeHeader(metaData)

        csvSampleSheetMiSeq += "\n[Data]\n"

        // add header names
        csvSampleSheetMiSeq += this.truSeqTableHeadersOg.join(',') + "\n" // want og headers


        // add samples
        samplesList.forEach((x) => {
            // slice to get original rows :ie not last extra row
            if (x.length === 12) {
                x.pop() // pop extra row at end
            }
            x.splice(8, 1) // splice refernece out
            x.splice(5, 2) // splice I5 index out

            csvSampleSheetMiSeq += x.join(',') + "\n"

        })


        // })
        let fileName = metaData.miseqExpName + '_' + metaData.date.split('-').join('_') + '_SampleSheet.csv'
        let csvSampleSheetMiSeqData = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });

        this.sampleSheetToPass.append('file', new File([csvSampleSheetMiSeqData], fileName))

        // // old way of downloading sample sheet directly to user
        let csvUrl = URL.createObjectURL(csvSampleSheetMiSeqData);

        let hiddenElement = document.createElement('a');
        hiddenElement.href = csvUrl;
        hiddenElement.target = '_blank';
        hiddenElement.download = fileName; // edit this to properly name the sample sheet
        hiddenElement.click();
        callback(true)
    }

    // make dynamic SampleSheet
    makeDynamicSampleSheet(samplesList, metaData, callback) {

        let csvSampleSheetMiSeq = ''

        // make header/settings/reads etc
        csvSampleSheetMiSeq += this.#makeHeader(metaData)

        csvSampleSheetMiSeq += "\n[Data]\n"

        // add header names
        csvSampleSheetMiSeq += this.miSeqTableHeaders.join(',') + "\n" // want all headers

        // add samples
        samplesList.forEach((x) => {
            // want all info
            csvSampleSheetMiSeq += x.join(',') + "\n"
        })


        let fileName = metaData.miseqExpName + '_' + metaData.date.split('-').join('_') + '_Additional_Info.csv'
        let csvDataDynamic = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });

        this.miSeqDynamicFile = new File([csvDataDynamic], fileName)

        callback(true)
    }

    #makeHeader(metaData) {
        let csvSampleSheetMiSeq = ''
        csvSampleSheetMiSeq += '[Header]\n';
        csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + metaData.lrmaId + '\n'
        csvSampleSheetMiSeq += "Experiment Name," + metaData.miseqExpName + '\n'
        csvSampleSheetMiSeq += "Date," + metaData.date + '\n'
        csvSampleSheetMiSeq += "Module," + metaData.module + '\n'
        csvSampleSheetMiSeq += "Workflow," + metaData.workflow + '\n'
        csvSampleSheetMiSeq += "Library Prep Kit," + metaData.libPrepKit + '\n'
        csvSampleSheetMiSeq += "Index Kit," + metaData.indexKit + '\n'
        csvSampleSheetMiSeq += "Chemistry," + metaData.chemistry + '\n'
        csvSampleSheetMiSeq += "\n[Reads]\n"
        csvSampleSheetMiSeq += metaData.reads1 + '\n'
        csvSampleSheetMiSeq += "\n[Settings]\n"
        csvSampleSheetMiSeq += "adapter," + metaData.adapter + '\n'
        csvSampleSheetMiSeq += "adapterRead2," + metaData.adapterRead2 + '\n'
        return csvSampleSheetMiSeq
    }

    // Get Samples ERRORS code
    getSamplesErrors(samples, metaData, callback) {
        let internalErrors = false

        /*
        * MetaData (TruSeq Specific) Errors
        */
        // check adapter and adapterRead2 are not empty for truseq
        if (metaData.adapter === '' || metaData.adapterRead2 === '') {
            alert('Please fill in adapter values for TruSeq', 'danger')
            errors = true
        }


        /*
        * Samples Errors
        */
        let i7list = []
        let allSampleIds = []
        // let allSampleNames = []

        if (samples.length < 1) {
            alert('Please add samples', 'danger')
            internalErrors = true
            return;
        }

        // check sample errors here
        samples.forEach((x, i) => {

            // convert - and ' ' to _
            x[0] = x[0].split('-').join('_')
            x[0] = x[0].split(' ').join('_')
            x[1] = x[1].split('-').join('_')
            x[1] = x[1].split(' ').join('_')
            x[7] = x[7].split('-').join('_')
            x[7] = x[7].split(' ').join('_')


            if (!x[0]) {
                alert('Missing Sample_ID in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (!x[3]) {
                alert('Missing I7 Index in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (!x[5] && !isTruSeq) { // only check for i5 when not trueseq
                alert('Missing I5 Index in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (x[3].length != 6) {
                alert('I7 Index length is incorrect length for Sample ' + (i + 1), 'danger')
                internalErrors = true;
            }

            // add all i7 to list to check and make sure none are the same
            i7list.push(x[3])


            // add all sample Ids/Names to list
            allSampleIds.push(x[0])
            // allSampleNames.push(x[1])

            // // check for references in sample sheet being none/empty
            // if (x[8] === 'None' || x[8] === '') {
            //     // add alert and stop here if desired
            //     // internalErrors = true
            // }

        })

        // check to make sure no repeats
        let i7Set = [...new Set(i7list)]
        if (i7Set.length !== i7list.length) {
            alert('I7 barcode cannot be repeated in Samples', 'danger')
            internalErrors = true
        }

        // check that all sample_Ids and names are unique
        if (allSampleIds.length !== _.uniq(allSampleIds).length) {
            alert('Please make sure all sample Ids are unique', 'danger')
            internalErrors = true
        }


        callback(internalErrors)
    }
}