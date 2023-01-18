import {i5BarcodeKits, i7BarcodeKits, selectReferenceData} from '/barcodeKits.js'


let isTruSeq = false

$(document).ready(function () {

    // initialize pop overs
    $('.indexInfo').popover({
        container: 'body',
        content: "Pick or type your own indexes here"
    })
    $('.sampleSheetRefInfo').popover({
        container: 'body',
        content: "Input name of reference if using multiple references. Please attach reference files below"
    })
    $('.extraInfo').popover({
        container: 'body',
        content: "Add additional sample information here. Ex: Cell_Type, Polarity, idk"
    })

    // initialize select2 boxes
    $('.select2ClassAddMiSeq').select2({
        placeholder: 'None',
        tags: true
    })
    $('.select2ClassAddMiSeqI7').select2({
        data: i7BarcodeKits.results,
        tags: true,
        createTag: (params) => {

            let regex = /^([ATGCN]{8})$/;
            let regexPass = regex.test(params.term)
            if (regexPass) {
                return {
                    id: params.term,
                    text: params.term
                }
            }

            return null

        }
    })
    $('.select2ClassAddMiSeqI5').select2({
        data: i5BarcodeKits.results,
        tags: true,
        createTag: (params) => {

            let regex = /^([ATGCN]{8})$/;
            let regexPass = regex.test(params.term)
            if (regexPass) {
                return {
                    id: params.term,
                    text: params.term
                }
            }
            return null
        }
    })
    $('.select2ClassAddMiSeqRef').select2({
        data: selectReferenceData.results
    })



    // event listeners onto buttons and inputs
    document.getElementById('miseqExperimentName').addEventListener('input', noSpecialChars)
    let rm_row_btns = document.querySelectorAll('.rm-row-btn')
    Array.from(rm_row_btns).forEach(x => {
        // x.addEventListener('click', () => remove_tr(this))
        x.addEventListener('click', remove_tr)
    })
    let sampIds = document.querySelectorAll('.sampId')
    Array.from(sampIds).forEach(x => {
        x.addEventListener('input', noSpecialChars)
    })
    document.getElementById('inputReads1').addEventListener('input', numbersOnly)
    document.getElementById('inputReads2').addEventListener('input', numbersOnly)

    $('#libraryDrop').on('select2:select', (e) => {
        const value = e.params.data.id

        if (value === 'TruSeq Stranded mRNA') {
            isTruSeq = true
            document.getElementById('truSeqAdapterDiv').style.display = 'block'
            document.getElementById('miseq_extra_1').value = 'Lane'
            document.getElementById('miseq_extra_2').value = 'Index_Plate_Well'
            document.getElementById('miseq_extra_1').disabled = true
            document.getElementById('miseq_extra_2').disabled = true
        } else {
            isTruSeq = false
            document.getElementById('truSeqAdapterDiv').style.display = 'none'
            document.getElementById('miseq_extra_1').value = ''
            document.getElementById('miseq_extra_2').value = ''
            document.getElementById('miseq_extra_1').disabled = false
            document.getElementById('miseq_extra_2').disabled = false
        }
    })
    document.getElementById('adapterInput').addEventListener('input', indexInputFilter)
    document.getElementById('adapterRead2Input').addEventListener('input', indexInputFilter)

    // hey its not pretty but it works
    document.getElementById('add1MiseqRow').addEventListener('click', create_tr)
    document.getElementById('add3MiseqRow').addEventListener('click', () => {
        create_tr(); create_tr(); create_tr();
    })
    document.getElementById('add5MiseqRow').addEventListener('click', () => {
        create_tr(); create_tr(); create_tr(); create_tr(); create_tr();
    })

    // auto pop with a few more rows
    create_tr(); create_tr(); create_tr(); create_tr(); create_tr();
    create_tr(); create_tr(); create_tr(); create_tr(); create_tr();

});



let samples = [];
let reads1 = 151;
let reads2 = 151;
let lrmaId = Math.floor(1000 + Math.random() * 9000);
export let miseqExpName = ""
let date = new Date();
let module = "";
let workflow = "";
let libPrepKit = "";
let indexKit = "";
let chemistry = "";
let adapter = ""
let adapterRead2 = ""
// let assay = ""



const getAllMiSeqTableValsPromise = () => {

    return new Promise((resolve, reject) => {
        getAllMiSeqTableVals((data) => {
            console.log('end of get all table vals promise', samples)
            resolve(data)
        })
    })
}

export const handleMiSeqSampleSheetPromise = () => {
    console.log('Starting handle MiSeq Sample Sheet Promise')
    return new Promise((res, rej) => {
        handleMiSeqSampleSheet((data) => {
            console.log("Finished handle miseq sample sheet promise")
            res(data)
        })
    })
}


const makeMiseqSampleSheetPromise = (samplesList) => {
    console.log("Starting make MiSeq Sample sheet promise", samples)
    return new Promise((res, rej) => {
        makeMiseqSampleSheet(samplesList, (data) => {
            console.log("Finish make MiSeq Sample sheet promise", samples)
            res(data)
        })
    })
}

const makeDynamicSampleSheetPromise = (samplesList) => {
    return new Promise((res, rej) => {
        makeDynamicSampleSheet(samplesList, (data) => {
            res(data)
        })
    })
}

const getSamplesErrorsPromise = () => {
    console.log("starting get Samples errors promise", samples)
    return new Promise((res, rej) => {
        getSamplesErrors((data) => {
            res(data)
        })
    })
}

// switch to stop jira ticket creation if samplesheet fails
export let miseqSampleSheetCreationSuccess = true;
/*
* Submit handler for MiSeq
*/
async function handleMiSeqSampleSheet(callback) {

    // get values from form
    miseqExpName = document.getElementById('miseqExperimentName').value // probably pull out of miseq
    reads1 = document.getElementById('inputReads1').value
    reads2 = document.getElementById('inputReads2').value
    adapter = document.getElementById('adapterInput').value // truseq
    adapterRead2 = document.getElementById('adapterRead2Input').value // truseq
    module = document.getElementById('moduleDrop').value
    workflow = document.getElementById('workflowDrop').value
    libPrepKit = document.getElementById('libraryDrop').value
    indexKit = document.getElementById('indexKitDrop').value
    chemistry = document.getElementById('chemistryDrop').value

    // set set samples from table
    samples = [] // empty sample array for mistakes

    let errors = false;

    // samples = await getAllMiSeqTableValsPromise()
    await getAllMiSeqTableValsPromise()

    // Check if required fields are populated correctly
    if (!miseqExpName) {
        alert('Please add Experiment Name!', 'danger')
        errors = true
    }

    // fix simple errors and type check etc
    anyMiSeqErrors = await getSamplesErrorsPromise()

    // check only numbers in reads
    if (isNaN(reads1) || isNaN(reads2)) {
        alert('Make sure Reads are only numbers', 'danger')
        errors = true
    }

    // check adapter and adapterRead2 are not empty for truseq
    if (isTruSeq && (adapter === '' || adapterRead2 === '')) {
        alert('Please fill in adapter values for TruSeq', 'danger')
        errors = true
    }

    if (errors || anyMiSeqErrors) {
        miseqSampleSheetCreationSuccess = false
        return;
    }

    miseqExpName = miseqExpName.split('-').join('_') // replace - with _

    // make dynamic sample sheet
    await makeDynamicSampleSheetPromise(samples)

    // make samplesheet
    await makeMiseqSampleSheetPromise(samples)


    // attach samplesheet to folder
    await fetch("/downloadSampleSheet", {
        method: "POST",
        body: sampleSheetToPass,
    }).catch((error) => ("Something went wrong!", error));

    callback(true)

}


let sampleSheetToPass = new FormData()

function makeMiseqSampleSheet(samplesList, callback) {

    let csvSampleSheetMiSeq = '[Header]\n';
    csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + lrmaId + '\n'
    csvSampleSheetMiSeq += "Experiment Name," + miseqExpName + '\n'
    csvSampleSheetMiSeq += "Date," + date.toISOString().split('T')[0] + '\n'
    csvSampleSheetMiSeq += "Module," + module + '\n'
    csvSampleSheetMiSeq += "Workflow," + workflow + '\n'
    if (!isTruSeq) {
        csvSampleSheetMiSeq += "Library Prep Kit," + libPrepKit + '\n'
    } else {
        // truseq uses Assay
        csvSampleSheetMiSeq += "Assay," + libPrepKit + '\n'
    }
    csvSampleSheetMiSeq += "Index Kit," + indexKit + '\n'
    csvSampleSheetMiSeq += "Chemistry," + chemistry + '\n'

    csvSampleSheetMiSeq += "\n[Reads]\n"
    csvSampleSheetMiSeq += reads1 + '\n'
    if (!isTruSeq) {csvSampleSheetMiSeq += reads2 + '\n'}

    csvSampleSheetMiSeq += "\n[Settings]\n"
    if (isTruSeq) {
        csvSampleSheetMiSeq += "adapter," + adapter + '\n'
        csvSampleSheetMiSeq += "adapterRead2," + adapterRead2 + '\n'
    }

    csvSampleSheetMiSeq += "\n[Data]\n"

    // add header names
    if (!isTruSeq) {
        csvSampleSheetMiSeq += miSeqTableHeadersOg.join(',') + "\n" // want og headers
    } else {
        csvSampleSheetMiSeq += truSeqTableHeadersOg.join(',') + "\n" // want og headers
    }


    if (!isTruSeq) {
        // add samples
        samplesList.forEach((x) => {
            // slice to get original rows
            x = x.slice(0, 8)
            csvSampleSheetMiSeq += x.join(',') + "\n"

        })
    } else {
        // add samples
        samplesList.forEach((x) => {
            // slice to get original rows
            if (x.length === 12) {
                x.pop()
            }
            x.splice(8, 1)
            // reorganize stuff
            let tempDes = x.splice(2, 1)
            x.push(tempDes)
            let tempLane = x.splice(7, 1)
            let tempPlateWell = x.splice(7, 1)
            x.unshift(tempLane)
            x.splice(3, 0, tempPlateWell)
            x.splice(6, 2) // splice out I5 Index?
            csvSampleSheetMiSeq += x.join(',') + "\n"

        })
    }



    // })
    let fileName = miseqExpName + '_' + date.toISOString().split('T')[0].split('-').join('_') + '_SampleSheet.csv'
    let csvSampleSheetMiSeqData = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });


    sampleSheetToPass.append('file', new File([csvSampleSheetMiSeqData], fileName))

    // // old way of downloading sample sheet directly to user
    let csvUrl = URL.createObjectURL(csvSampleSheetMiSeqData);

    let hiddenElement = document.createElement('a');
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = 'PortalCreatedSampleSheet.csv'; // edit this to properly name the sample sheet
    hiddenElement.click();
    callback(true)
}

// let miSeqOnlycsvFileToPass = new FormData()

export let miSeqDynamicFile

function makeDynamicSampleSheet(samplesList, callback) {

    let csvSampleSheetMiSeq = '[Header]\n';
    csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + lrmaId + '\n'
    csvSampleSheetMiSeq += "Experiment Name," + miseqExpName + '\n'
    csvSampleSheetMiSeq += "Date," + date.toISOString().split('T')[0] + '\n'
    csvSampleSheetMiSeq += "Module," + module + '\n'
    csvSampleSheetMiSeq += "Workflow," + workflow + '\n'
    if (!isTruSeq) {
        csvSampleSheetMiSeq += "Library Prep Kit," + libPrepKit + '\n'
    } else {
        // truseq uses Assay
        csvSampleSheetMiSeq += "Assay," + libPrepKit + '\n'
    }
    csvSampleSheetMiSeq += "Index Kit," + indexKit + '\n'
    csvSampleSheetMiSeq += "Chemistry," + chemistry + '\n'

    csvSampleSheetMiSeq += "\n[Reads]\n"
    csvSampleSheetMiSeq += reads1 + '\n'
    csvSampleSheetMiSeq += reads2 + '\n'

    csvSampleSheetMiSeq += "\n[Settings]\n"
    if (isTruSeq) {
        csvSampleSheetMiSeq += "Adapter," + adapter + '\n'
        csvSampleSheetMiSeq += "AdapterRead2," + adapterRead2 + '\n'
    }

    csvSampleSheetMiSeq += "\n[Data]\n"

    // add header names
    csvSampleSheetMiSeq += miSeqTableHeaders.join(',') + "\n" // want all headers

    // add samples
    samplesList.forEach((x) => {
        // want all info
        csvSampleSheetMiSeq += x.join(',') + "\n"
    })


    let fileName = miseqExpName + '_' + date.toISOString().split('T')[0].split('-').join('_') + '_Additional_Info.csv'
    let csvDataDynamic = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });

    miSeqDynamicFile = new File([csvDataDynamic], fileName)
    // miSeqOnlycsvFileToPass.append('file', new File([csvDataDynamic], fileName))

    callback(true)
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



/*
*
* MiSEQ Table
*
*/

/*
* Fxn makes table row
*/
function create_tr() {

    $('.select2ClassAddMiSeq').select2('destroy')

    let table_body = document.getElementById('miseq_table_body'),
        first_tr = table_body.lastElementChild,
        tr_clone = first_tr.cloneNode(true);

    table_body.append(tr_clone);

    clean_last_tr(table_body.lastElementChild);

    $('.select2ClassAddMiSeq').select2({
        placeholder: 'None',
        tags: true
    })

    $('.select2ClassAddMiSeqI7').select2({
        placeholder: 'None',
        tags: true,
        createTag: (params) => {

            let regex = /^([ATGCN]{8})$/;
            let regexPass = regex.test(params.term)
            if (regexPass) {
                // return addOptionI7(params.term)

                return {
                    id: params.term,
                    text: params.term
                }
            }

            return null

        }
    })

    $('.select2ClassAddMiSeqI5').select2({
        placeholder: 'None',
        tags: true,
        createTag: (params) => {

            let regex = /^([ATGCN]{8})$/;
            let regexPass = regex.test(params.term)
            if (regexPass) {
                return {
                    id: params.term,
                    text: params.term
                }
            }

            return null

        }
    })

    // Re add event listeners everywhere
    let rm_row_btns = document.querySelectorAll('.rm-row-btn')
    Array.from(rm_row_btns).forEach(x => {
        // x.addEventListener('click', () => remove_tr(this))
        x.addEventListener('click', remove_tr)
        x.myParam = 'this'
    })
    let sampIds = document.querySelectorAll('.sampId')
    Array.from(sampIds).forEach(x => {
        x.addEventListener('input', noSpecialChars)
        // x.oninput = 'noSpecialChars(this)'
    })


}

/*
* Helper fxn to clean the newly created row
*/
function clean_last_tr(lastTr) {
    let children = lastTr.children;

    children = Array.isArray(children) ? children : Object.values(children);
    children.forEach((x, i) => {
        // clear all inputs
        if (x !== lastTr.lastElementChild && i !== 0) {
            x.firstElementChild.value = '';
        }
        // set row number
        if (i === 0) {
            let rowNum = parseInt(x.innerText)
            rowNum = rowNum + 1
            x.innerText = rowNum
        }

    });
}

/*
* Fxn to delete table row
*/
function remove_tr() {

    if (this === undefined) { return }
    if (this.closest('tbody').childElementCount == 1) {
        alert("You don't have permission to delete this", "warning");
    } else {
        this.closest('tr').remove();

        // and renumber everything
        let rowNum = 1
        $("#miseq_table_body tr").each(function () {
            $(this).children(":first").text(rowNum)
            rowNum++
        })
    }
}

// event listeners to call add to select2 options
$('.select2ClassAddMiSeqI7').on('select2:select', function (e) {
    let item = e.params.data.id
    // check if item is in original dataset
    // jk idk but it works this way
    addOptionI7(item)
});
$('.select2ClassAddMiSeqI5').on('select2:select', function (e) {
    let item = e.params.data.id
    // check if item is in original dataset
    // jk idk but it works this way
    addOptionI5(item)
});
$('.select2ClassAddMiSeqRef').on('select2:select', function (e) {
    let item = e.params.data.id
    // check if item is in original dataset
    // jk idk but it works this way
    addOptionRef(item)
});


// code for adding new tags to data in samplesheet table
function addOptionI7(term) {
    $('.select2ClassAddMiSeqI7').select2('destroy')

    $('.select2ClassAddMiSeqI7').select2({
        data: [{ "id": term, "text": term }],
        placeholder: 'None',
        tags: true,
        createTag: (params) => {

            let regex = /^([ATGCN]{8})$/;
            let regexPass = regex.test(params.term)
            if (regexPass) {
                return {
                    id: params.term,
                    text: params.term
                }
                // return addOptionI7(params.term)
            }

            return null

        }
    })
    // idk why this is needed her but it works
    $('.select2ClassAddMiSeqI7').on('select2:select', function (e) {
        let item = e.params.data.id
        addOptionI7(item)
    });
    // return { "id": term, "text": term }
}

function addOptionI5(term) {
    $('.select2ClassAddMiSeqI5').select2('destroy')

    $('.select2ClassAddMiSeqI5').select2({
        data: [{ "id": term, "text": term }],
        placeholder: 'None',
        tags: true,
        createTag: (params) => {

            let regex = /^([ATGCN]{8})$/;
            let regexPass = regex.test(params.term)
            if (regexPass) {
                return {
                    id: params.term,
                    text: params.term
                }
            }

            return null

        }
    })
    // idk why this is needed her but it works
    $('.select2ClassAddMiSeqI5').on('select2:select', function (e) {
        let item = e.params.data.id
        addOptionI5(item)
    });
}

function addOptionRef(term) {
    $('.select2ClassAddMiSeqRef').select2('destroy')

    $('.select2ClassAddMiSeqRef').select2({
        data: [{ "id": term, "text": term }],
        placeholder: 'None',
        tags: true
    })
    // idk why this is needed her but it works
    $('.select2ClassAddMiSeqRef').on('select2:select', function (e) {
        let item = e.params.data.id
        addOptionRef(item)
    });
}



// Get Samples ERRORS code
async function getSamplesErrors(callback) {
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
        if (!x[5] && !isTruSeq) { // only check for i5 when not trueseq
            alert('Missing I5 Index in Sample ' + (i + 1), 'danger')
            internalErrors = true
        }


        // this is where we need to do checking on the sample information
        // need to double check the index on these
        // (these should be good bc using dropdown but also has self input so keep... )
        // if (x[3].match(/[^ATCGN]/) || x[5].match(/[^ATCGN]/)) {
        //     alert('Invalid characters present in I5 or I7 Index for Sample ' + (i + 1), 'danger')
        //     internalErrors = true;
        // }
        // if (x[3].length != 8 || x[5].length != 8) {
        //     alert('I5 or I7 Index length is incorrect length for Sample ' + (i + 1), 'danger')
        //     internalErrors = true;
        // }

        // make sure i5 and i7 index are not the same
        if (x[3] === x[5] && x[3] && x[5] && !isTruSeq) {
            alert('I5 and I7 Index in Sample ' + (i + 1) + ' cannot be the same', 'danger')
            internalErrors = true
        }

        // add I7 and I5 pair to list
        if (!isTruSeq) {
            i7andi5Pairs.push({ 'i7': x[3], 'i5': x[5] })
        }


        // add all sample Ids/Names to list
        allSampleIds.push(x[0])
        // allSampleNames.push(x[1])

        // // check for references in sample sheet being none/empty
        // if (x[8] === 'None' || x[8] === '') {
        //     // add alert and stop here if desired
        //     // internalErrors = true
        // }

    })

    // check that all I7 and I5 pairs are unique
    if (!isTruSeq) {
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

    // check that all I7 and I5 pairs are from same barcoding kit (group)
    if (!isTruSeq) {
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
    }
    // check that all sample_Ids and names are unique
    if (allSampleIds.length !== _.uniq(allSampleIds).length) {
        alert('Please make sure all sample Ids are unique', 'danger')
        internalErrors = true
    }

    callback(internalErrors)
}


let miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project', 'Reference']
let miSeqTableHeadersOg = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project']
// let truSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project', 'Reference']
let truSeqTableHeadersOg = ['Lane', 'Sample_ID', 'Sample_Name', 'Index_Plate_Well', 'I7_Index_ID', 'index', 'Sample_Project', 'Description'] // tech true
// let truSeqTableHeadersOg = ['Sample_ID', 'Sample_Name', 'I7_Index_ID', 'index', 'Sample_Project', 'Description']
let anyMiSeqErrors = false
/*
* Pulls all of sample information frome the table... 
* only pulls information from extra columns if title for those columns is filled in
*/
let hasExtra1 = false
let hasExtra2 = false
let hasExtra3 = false
let miSeqTableVals = []
async function getAllMiSeqTableVals(callback) {

    miSeqTableVals = []
    anyMiSeqErrors = false

    // reset just in case
    // let miSeqTableVals = []
    miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project', 'Reference']

    // see if any of the extra fields were filled in
    let miseqExtra1Col = $('#miseq_extra_1').val().split(' ').join('_').split('-').join('_')
    let miseqExtra2Col = $('#miseq_extra_2').val().split(' ').join('_').split('-').join('_')
    let miseqExtra3Col = $('#miseq_extra_3').val().split(' ').join('_').split('-').join('_')

    // let hasExtra1 = false
    // let hasExtra2 = false
    // let hasExtra3 = false

    if (miseqExtra1Col) {
        hasExtra1 = true
        miSeqTableHeaders.push(miseqExtra1Col)
    }
    if (miseqExtra2Col) {
        hasExtra2 = true
        miSeqTableHeaders.push(miseqExtra2Col)
    }
    if (miseqExtra3Col) {
        hasExtra3 = true
        miSeqTableHeaders.push(miseqExtra3Col)
    }

    // get values
    let geet = $("#miseq_table_body tr").each(async function (x) {

        let rowVals = []

        let id = $(this).find(".sampId").val()
        // let name = $(this).find(".sampName").val()
        let des = $(this).find(".sampDes").val()
        let i7 = $(this).find(".sampI7").val()
        let i5 = $(this).find(".sampI5").val()
        let proj = $(this).find(".sampProj").val()
        let ref = $(this).find(".sampRef option:selected").text()
        let ex1 = $(this).find(".sampEx1").val()
        let ex2 = $(this).find(".sampEx2").val()
        let ex3 = $(this).find(".sampEx3").val()

        // if everything (important) is empty then just skip row
        if (!id && !i7 && !i5) {
            // console.log("Skip This Row")
            return;
        }

        // clean commas from des
        des.split(',').join(' ')

        rowVals.push(id)
        // rowVals.push(name)
        rowVals.push(id)
        rowVals.push(des)
        rowVals.push(i7)
        rowVals.push(i7)
        rowVals.push(i5)
        rowVals.push(i5)
        rowVals.push(proj)
        rowVals.push(ref)


        if (hasExtra1) {
            rowVals.push(ex1)
        }
        if (hasExtra2) {
            rowVals.push(ex2)
        }
        if (hasExtra3) {
            rowVals.push(ex3)
        }

        miSeqTableVals.push(rowVals)

        // console.log('miSeqTableVals: ', miSeqTableVals)
        // console.log("done with geet")

    })

    $.when.apply(geet, miSeqTableVals).done(async () => {
        console.log("starting geet promise")
        samples = miSeqTableVals
        callback(miSeqTableVals)
    })

}


const delay = ms => new Promise(res => setTimeout(res, ms));


// no special characters
function noSpecialChars(e) {
    let input = e.target
    //let regex = /[^a-z]/gi; only allows letters
    let regex = /[<>!@#$%^&*()|/?:;[\]'"{},.`~=+\\]/gi; // allows anything but these characters
    input.value = input.value.replace(regex, "")
}

// function to limit inputs to numbers only
function numbersOnly(e) {
    let input = e.target
    let regex = /[^0-9]/gi;
    input.value = input.value.replace(regex, "")
}

// only valid barcode seq
function indexInputFilter(e) {
    let input = e.target
    let regex = /[^AGTCN]/gi;
    input.value = input.value.toUpperCase()
    input.value = input.value.replace(regex, "")
}
