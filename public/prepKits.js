import * as barcodeKit from '/barcodeKits.js'

class BasicKit {
    sampleSheetToPass = new FormData();
    miSeqDynamicFile

    isCustom = false

    // make SampleSheet
    makeMiseqSampleSheet(samplesList, metaData, callback) {

        let csvSampleSheetMiSeq = ''


        // make header/settings/reads etc
        csvSampleSheetMiSeq += this.makeHeader(metaData)

        csvSampleSheetMiSeq += "\n[Data]\n"

        let csvSampleSheetMiSeqDynamic = csvSampleSheetMiSeq
        // add samples
        samplesList.forEach((x) => {
            // dynamic 
            csvSampleSheetMiSeqDynamic += x.join(',') + "\n"

            // slice to get original rows
            if (metaData.readType === 'paired') {
                x = x.slice(0, 8)
            } else {
                x = x.slice(0, 6)
            }

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

    // generally overwritten per subclass
    makeHeader(metaData) {
        let csvSampleSheetMiSeq = ''
        csvSampleSheetMiSeq += '[Header]\n';
        // csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + metaData.lrmaId + '\n'
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

export class CustomKit extends BasicKit { // Custom

    isCustom = true

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

    // makeMiseqSampleSheet inherited from BasicKit

    makeHeader(metaData) {
        let csvSampleSheetMiSeq = ''
        csvSampleSheetMiSeq += '[Header]\n';
        // csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + metaData.lrmaId + '\n'
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

export class TruSeqKit extends BasicKit { // TruSeq Stranded mRNA

    defaultReference = "hg38"

    indexKits = [
        {
            "id": "TruSeq RNA Single Indexes Set A",
            "text": "TruSeq RNA Single Indexes Set A",
            "kit": barcodeKit.truSeqSingleIndexSetAKit
        },
        {
            "id": "TruSeq RNA Single Indexes Set B",
            "text": "TruSeq RNA Single Indexes Set B",
            "kit": barcodeKit.truSeqSingleIndexSetBKit
        },
        {
            "id": "TruSeq RNA Single Indexes Set A B",
            "text": "TruSeq RNA Single Indexes Set A B",
            "kit": barcodeKit.truSeqSingleIndexSetABKit
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set A B C D",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set A B C D",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set A",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set A",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetA
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set B",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set B",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetB
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set C",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set C",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetC
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set D",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set D",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetD
        }
    ]

    // makeMiseqSampleSheet inherited from BasicKit

    makeHeader(metaData) {
        let csvSampleSheetMiSeq = ''
        csvSampleSheetMiSeq += '[Header]\n';
        // csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + metaData.lrmaId + '\n'
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
            case 'TruSeq RNA Single Indexes Set A':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetAKit.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetAKit.adapterRead2 + '\n'
                break;

            case 'TruSeq RNA Single Indexes Set B':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetBKit.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetBKit.adapterRead2 + '\n'
                break;

            case 'TruSeq RNA Single Indexes Set A B':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetABKit.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetABKit.adapterRead2 + '\n'
                break;

            case 'IDT-ILMN Nextera DNA UD Indexes Set A B C D':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD.adapter + '\n'
                break;
            case 'IDT-ILMN Nextera DNA UD Indexes Set A':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetA.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.idtILMNNexteraDNAUDIndexesSetA.adapter + '\n'
                break;
            case 'IDT-ILMN Nextera DNA UD Indexes Set B':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetB.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.idtILMNNexteraDNAUDIndexesSetB.adapter + '\n'
                break;

            case 'IDT-ILMN Nextera DNA UD Indexes Set C':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetC.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.idtILMNNexteraDNAUDIndexesSetC.adapter + '\n'
                break;
            case 'IDT-ILMN Nextera DNA UD Indexes Set D':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetD.adapter + '\n'
                csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.idtILMNNexteraDNAUDIndexesSetD.adapter + '\n'
                break;
        }

        return csvSampleSheetMiSeq
    }

}

export class AmpliSeqKit extends BasicKit { // AmpliSeq Library PLUS for Illumina

    indexKits = [
        {
            "id": "AmpliSeq CD Indexes Set A B C D",
            "text": "AmpliSeq CD Indexes Set A B C D",
            "kit": barcodeKit.ampliSeqCDIndexesSetABCD
        },
        {
            "id": "AmpliSeq CD Indexes Set A",
            "text": "AmpliSeq CD Indexes Set A",
            "kit": barcodeKit.ampliSeqCDIndexesSetA
        },
        {
            "id": "AmpliSeq CD Indexes Set B",
            "text": "AmpliSeq CD Indexes Set B",
            "kit": barcodeKit.ampliSeqCDIndexesSetB
        },
        {
            "id": "AmpliSeq CD Indexes Set C",
            "text": "AmpliSeq CD Indexes Set C",
            "kit": barcodeKit.ampliSeqCDIndexesSetC
        },
        {
            "id": "AmpliSeq CD Indexes Set D",
            "text": "AmpliSeq CD Indexes Set D",
            "kit": barcodeKit.ampliSeqCDIndexesSetD
        }
    ]

    // makeMiseqSampleSheet inherited from BasicKit

    makeHeader(metaData) {
        let csvSampleSheetMiSeq = ''
        csvSampleSheetMiSeq += '[Header]\n';
        // csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + metaData.lrmaId + '\n'
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


        csvSampleSheetMiSeq += "adapter," + barcodeKit.ampliSeqCDIndexesSetABCD.adapter + '\n'
        // csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetAKit.adapterRead2 + '\n'

        // switch (metaData.indexKit) {
        //     case 'TruSeq Single Index Set A':
        //         csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetAKit.adapter + '\n'
        //         csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetAKit.adapterRead2 + '\n'
        //         break;

        //     case 'TruSeq Single Index Set B':
        //         csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetBKit.adapter + '\n'
        //         csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetBKit.adapterRead2 + '\n'
        //         break;

        //     case 'TruSeq Single Index Set A B':
        //         csvSampleSheetMiSeq += "adapter," + barcodeKit.truSeqSingleIndexSetABKit.adapter + '\n'
        //         csvSampleSheetMiSeq += "adapterRead2," + barcodeKit.truSeqSingleIndexSetABKit.adapterRead2 + '\n'
        //         break;

        //     case 'IDT-ILMN Nextera DNA UD Indexes Set A B C D':
        //         csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD.adapter + '\n'
        //         break;

        // }

        return csvSampleSheetMiSeq
    }

}

export class NexteraXTKit extends BasicKit { // TruSeq Stranded mRNA

    // defaultReference = "hg38"

    indexKits = [

        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set A B C D",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set A B C D",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set A",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set A",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetA
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set B",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set B",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetB
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set C",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set C",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetC
        },
        {
            "id": "IDT-ILMN Nextera DNA UD Indexes Set D",
            "text": "IDT-ILMN Nextera DNA UD Indexes Set D",
            "kit": barcodeKit.idtILMNNexteraDNAUDIndexesSetD
        }
    ]

    // makeMiseqSampleSheet inherited from BasicKit

    makeHeader(metaData) {
        let csvSampleSheetMiSeq = ''
        csvSampleSheetMiSeq += '[Header]\n';
        // csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + metaData.lrmaId + '\n'
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
            case 'IDT-ILMN Nextera DNA UD Indexes Set A B C D':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetABCD.adapter + '\n'
                break;
            case 'IDT-ILMN Nextera DNA UD Indexes Set A':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetA.adapter + '\n'
                break;
            case 'IDT-ILMN Nextera DNA UD Indexes Set B':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetB.adapter + '\n'
                break;

            case 'IDT-ILMN Nextera DNA UD Indexes Set C':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetC.adapter + '\n'
                break;
            case 'IDT-ILMN Nextera DNA UD Indexes Set D':
                csvSampleSheetMiSeq += "adapter," + barcodeKit.idtILMNNexteraDNAUDIndexesSetD.adapter + '\n'
                break;

        }

        return csvSampleSheetMiSeq
    }

}