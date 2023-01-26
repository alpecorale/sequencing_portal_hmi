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

}
