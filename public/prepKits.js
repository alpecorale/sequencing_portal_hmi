import * as barcodeKit from '/barcodeKits.js'

export class CustomKit { // Custom

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


    // make SampleSheet
    makeMiseqSampleSheet(samplesList, metaData, callback) {

        let csvSampleSheetMiSeq = ''


        // make header/settings/reads etc
        csvSampleSheetMiSeq += this.#makeHeader(metaData)

        csvSampleSheetMiSeq += "\n[Data]\n"

        let csvSampleSheetMiSeqDynamic = csvSampleSheetMiSeq
        // add samples
        samplesList.forEach((x) => {
            // dynamic 
            csvSampleSheetMiSeqDynamic += x.join(',') + "\n"

            // slice to get original rows
            x = x.slice(0, 8)
            csvSampleSheetMiSeq += x.join(',') + "\n"

        })


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

        // handle dynamic
        let fileNameDynamic = metaData.miseqExpName + '_' + metaData.date.split('-').join('_') + '_Additional_Info.csv'
        let csvDataDynamic = new Blob([csvSampleSheetMiSeqDynamic], { type: 'text/csv' });

        this.miSeqDynamicFile = new File([csvDataDynamic], fileNameDynamic)

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
        if (metaData.readType === 'paired') {
            csvSampleSheetMiSeq += metaData.reads2 + '\n'
        }
        csvSampleSheetMiSeq += "\n[Settings]\n"

        // add switch case here if elements have additional settings ie adapters

        return csvSampleSheetMiSeq
    }

    // Get Samples ERRORS code
    getSamplesErrors(samples, metaData, callback) {

        let internalErrors = false
        console.log('samplesError', samples.length)

        if (samples.length <= 1) {
            alert('Please add samples', 'danger')
            internalErrors = true
            return;
        }

        let allSampleIds = []
        let i7andi5Pairs = [] // paired
        let i7list = [] // single


        // check sample errors here
        samples.forEach((x, i) => {
            if (i === 0) { return } // skip references

            if (!x[0]) {
                alert('Missing Sample_ID in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (!x[3]) {
                alert('Missing I7 Index in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }

            // add all ids to list
            allSampleIds.push(x[0])

            if (metaData.readType === "single") {

                // add all i7 to list to check and make sure none are the same
                i7list.push(x[3])


            } else {

                if (!x[5]) {
                    alert('Missing I5 Index in Sample ' + (i + 1), 'danger')
                    internalErrors = true
                }

                // make sure i5 and i7 index are not the same
                if (x[3] === x[5] && x[3] && x[5]) {
                    alert('I5 and I7 Index in Sample ' + (i + 1) + ' cannot be the same', 'danger')
                    internalErrors = true
                }

                // add I7 and I5 pair to list
                i7andi5Pairs.push({ 'i7': x[3], 'i5': x[5] })


            }

            // // check for references in sample sheet being none/empty
            // if (x[8] === 'None' || x[8] === '') {
            //     // add alert and stop here if desired
            //     // internalErrors = true
            // }

        })


        if (metaData.readType === 'single') {

            // check to make sure no repeats
            let i7Set = [...new Set(i7list)]
            if (i7Set.length !== i7list.length) {
                alert('I7 barcode cannot be repeated in Samples', 'danger')
                internalErrors = true
            }

        } else {

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

        }


        // check that all sample_Ids and names are unique
        if (allSampleIds.length !== _.uniq(allSampleIds).length) {
            alert('Please make sure all sample Ids are unique', 'danger')
            internalErrors = true
        }

        callback(internalErrors)
    }

}

export class TruSeqKit { // TruSeq Stranded mRNA

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
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set A B C D",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set A B C D",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD
        }
    ]


    // make SampleSheet
    makeMiseqSampleSheet(samplesList, metaData, callback) {

        let csvSampleSheetMiSeq = ''

        // make header/settings/reads etc
        csvSampleSheetMiSeq += this.#makeHeader(metaData)

        csvSampleSheetMiSeq += "\n[Data]\n"

        let csvSampleSheetMiSeqDynamic = csvSampleSheetMiSeq

        // add samples
        samplesList.forEach((x) => {
            // dynamic 
            csvSampleSheetMiSeqDynamic += x.join(',') + "\n"

            x = x.splice(0, 7) // splice out extra rows
            csvSampleSheetMiSeq += x.join(',') + "\n"
        })



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

        // handle dynamic
        let fileNameDynamic = metaData.miseqExpName + '_' + metaData.date.split('-').join('_') + '_Additional_Info.csv'
        let csvDataDynamic = new Blob([csvSampleSheetMiSeqDynamic], { type: 'text/csv' });

        this.miSeqDynamicFile = new File([csvDataDynamic], fileNameDynamic)

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
        if (metaData.readType === 'paired') {
            csvSampleSheetMiSeq += metaData.reads2 + '\n'
        }
        csvSampleSheetMiSeq += "\n[Settings]\n"


        switch (metaData.indexKit) {
            case 'TruSeq Single Index Set A':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetAKit.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetAKit.adapterRead2 + '\n'
                break;

            case 'TruSeq Single Index Set B':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetBKit.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetBKit.adapterRead2 + '\n'
                break;

            case 'TruSeq Single Index Set A B':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetABKit.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetABKit.adapterRead2 + '\n'
                break;

            case 'IDT-ILMN Nextera DNA UD Indexes Set A B C D':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD.adapter + '\n'
                break;

        }

        return csvSampleSheetMiSeq
    }

    // Get Samples ERRORS code
    getSamplesErrors(samples, metaData, callback) {

        let internalErrors = false

        if (samples.length <= 1) {
            alert('Please add samples', 'danger')
            internalErrors = true
            return;
        }

        let allSampleIds = []
        let i7andi5Pairs = [] // paired
        let i7list = [] // single


        // check sample errors here
        samples.forEach((x, i) => {
            if (i === 0) { return } // skip references

            if (!x[0]) {
                alert('Missing Sample_ID in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }
            if (!x[3]) {
                alert('Missing I7 Index in Sample ' + (i + 1), 'danger')
                internalErrors = true
            }

            // add all ids to list
            allSampleIds.push(x[0])

            if (metaData.readType === "single") {

                // add all i7 to list to check and make sure none are the same
                i7list.push(x[3])


            } else {

                if (!x[5]) {
                    alert('Missing I5 Index in Sample ' + (i + 1), 'danger')
                    internalErrors = true
                }

                // make sure i5 and i7 index are not the same
                if (x[3] === x[5] && x[3] && x[5]) {
                    alert('I5 and I7 Index in Sample ' + (i + 1) + ' cannot be the same', 'danger')
                    internalErrors = true
                }

                // add I7 and I5 pair to list
                i7andi5Pairs.push({ 'i7': x[3], 'i5': x[5] })


            }

            // // check for references in sample sheet being none/empty
            // if (x[8] === 'None' || x[8] === '') {
            //     // add alert and stop here if desired
            //     // internalErrors = true
            // }

        })


        if (metaData.readType === 'single') {

            // check to make sure no repeats
            let i7Set = [...new Set(i7list)]
            if (i7Set.length !== i7list.length) {
                alert('I7 barcode cannot be repeated in Samples', 'danger')
                internalErrors = true
            }

        } else {

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

        }


        // check that all sample_Ids and names are unique
        if (allSampleIds.length !== _.uniq(allSampleIds).length) {
            alert('Please make sure all sample Ids are unique', 'danger')
            internalErrors = true
        }

        callback(internalErrors)
    }
}


// 
// Alert Stuff
//
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

const alert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}