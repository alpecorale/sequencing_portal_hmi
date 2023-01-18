import { i5BarcodeKits, i7BarcodeKits, selectReferenceData } from '/barcodeKits.js'
import { CustomKit, TruSeqKit } from '/prepKits.js';


let hotKit = new CustomKit() // prepKits.js Class for Custom Kit

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

            let regex = /^([ATGCN]{6,8})$/;
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

            let regex = /^([ATGCN]{6,8})$/;
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


        switch (value) {
            case 'Custom':
                hotKit = new CustomKit();
                document.getElementById('truSeqAdapterDiv').style.display = 'none'
                document.getElementById('miseq_extra_1').value = ''
                document.getElementById('miseq_extra_2').value = ''
                document.getElementById('miseq_extra_1').disabled = false
                document.getElementById('miseq_extra_2').disabled = false
                document.querySelectorAll('.read2Div').forEach(a => a.style.display = "block")
                document.querySelectorAll('.sampI5Col').forEach(a => a.style.display = "block")
                document.getElementById('inputReads1').value = "151"
                break;

            case 'TruSeq Stranded mRNA':
                hotKit = new TruSeqKit();
                document.getElementById('truSeqAdapterDiv').style.display = 'block'
                document.getElementById('miseq_extra_1').value = 'Lane'
                document.getElementById('miseq_extra_2').value = 'Index_Plate_Well'
                document.getElementById('miseq_extra_1').disabled = true
                document.getElementById('miseq_extra_2').disabled = true
                document.querySelectorAll('.read2Div').forEach(a => a.style.display = "none")
                document.querySelectorAll('.sampI5Col').forEach(a => a.style.display = "none")
                document.getElementById('inputReads1').value = "300"
                break;

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


const makeMiseqSampleSheetPromise = (samplesList, metaData) => {
    console.log("Starting make MiSeq Sample sheet promise", samples)
    return new Promise((res, rej) => {
        hotKit.makeMiseqSampleSheet(samplesList, metaData, (data) => {
            console.log("Finish make MiSeq Sample sheet promise", samples)
            res(data)
        })
    })
}

const makeDynamicSampleSheetPromise = (samplesList, metaData) => {
    return new Promise((res, rej) => {
        hotKit.makeDynamicSampleSheet(samplesList, metaData, (data) => {
            res(data)
        })
        miSeqDynamicFile = hotKit.miSeqDynamicFile
    })
}

const getSamplesErrorsPromise = (samplesInput, metaData) => {
    console.log("starting get Samples errors promise", samplesInput)
    return new Promise((res, rej) => {
        hotKit.getSamplesErrors(samplesInput, metaData, (data) => {
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

    let metaDataPackage = {
        lrmaId: lrmaId,
        miseqExpName: miseqExpName,
        date: date,
        module: module,
        workflow: workflow,
        libPrepKit: libPrepKit,
        indexKit: indexKit,
        chemistry: chemistry,
        reads1: reads1,
        reads2: reads2,
        adapter: adapter,
        adapterRead2: adapterRead2
    }

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
    anyMiSeqErrors = await getSamplesErrorsPromise(samples, metaData)

    // check only numbers in reads
    if (isNaN(reads1) || isNaN(reads2)) {
        alert('Make sure Reads are only numbers', 'danger')
        errors = true
    }

    if (errors || anyMiSeqErrors) {
        miseqSampleSheetCreationSuccess = false
        return;
    }

    miseqExpName = miseqExpName.split('-').join('_') // replace - with _


    // make dynamic sample sheet
    await makeDynamicSampleSheetPromise(samples, metaDataPackage)

    // make samplesheet
    await makeMiseqSampleSheetPromise(samples, metaDataPackage)


    // attach samplesheet to folder
    await fetch("/downloadSampleSheet", {
        method: "POST",
        body: hotKit.sampleSheetToPass,
    }).catch((error) => ("Something went wrong!", error));

    callback(true)

}


// let miSeqOnlycsvFileToPass = new FormData()

export let miSeqDynamicFile



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

            let regex = /^([ATGCN]{6,8})$/;
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

            let regex = /^([ATGCN]{6,8})$/;
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

            let regex = /^([ATGCN]{6,8})$/;
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

            let regex = /^([ATGCN]{6,8})$/;
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


let miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project', 'Reference']

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


        if (hasExtra1) { rowVals.push(ex1) }
        if (hasExtra2) { rowVals.push(ex2) }
        if (hasExtra3) { rowVals.push(ex3) }

        miSeqTableVals.push(rowVals)

    })

    $.when.apply(geet, miSeqTableVals).done(async () => {
        console.log("starting geet promise")
        samples = miSeqTableVals
        callback(miSeqTableVals)
    })

}


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
