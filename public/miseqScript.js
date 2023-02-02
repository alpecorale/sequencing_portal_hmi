import { selectReferenceData } from '/barcodeKits.js'
import { CustomKit, TruSeqKit, AmpliSeqKit } from '/prepKits.js';


let hotKit = new CustomKit() // prepKits.js Class for Custom Kit
let currentKit // barcode kit // clean this up
let indexWellGlobalPairs = {} // index well global pairs // clean this up
let addMiSeqColCounter = 0

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
        data: hotKit.indexKits[0].kit.i7Barcodes,
        tags: true,
        createTag: (params) => indexCreateTag(params)
    })
    $('.select2ClassAddMiSeqI5').select2({
        data: hotKit.indexKits[0].kit.i5Barcodes,
        tags: true,
        createTag: (params) => indexCreateTag(params)
    })
    $('.select2ClassAddMiSeqRef').select2({
        data: selectReferenceData.results
    })
    $('.select2ClassIndexWell').select2({
        data: [{ "id": "", "text": "None" }]
    })

    // load available kits from hotKit
    $('#indexKitDrop').select2({
        data: hotKit.indexKits
    })


    // event listeners onto buttons and inputs
    $(".extraCol1, .extraCol2, .extraCol3").hide()
    document.getElementById('addMiseqCol').addEventListener('click', addMiSeqCol)
    document.getElementById('swapIndexText').addEventListener('click', swapIndexNameType)


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


    $('#readTypeSwitch').on('select2:select', (e) => {
        const value = e.params.data.id

        // toggle read2 and i5 col
        switch (value) {
            case 'paired':
                document.querySelectorAll('.read2Div').forEach(a => a.style.display = "block")
                document.querySelectorAll('.sampI5Col').forEach(a => a.style.display = "block")
                break;

            case 'single':
                document.querySelectorAll('.read2Div').forEach(a => a.style.display = "none")
                document.querySelectorAll('.sampI5Col').forEach(a => a.style.display = "none")
                break;
        }

    })

    // Handle switching between Library Prep kits
    // makes/destroys columns from sample sheet as needed
    // populates index kit drop down with valid index kits
    $('#libraryDrop').on('select2:select', (e) => {
        const value = e.params.data.id

        switch (value) {
            case 'Custom':
                hotKit = new CustomKit();
                break;

            case 'TruSeq Stranded mRNA':
                hotKit = new TruSeqKit();
                break;

            case 'AmpliSeq Library PLUS for Illumina':
                hotKit = new AmpliSeqKit();
                break;
        }

        // swap read type
        swapReadType(hotKit.indexKits[0].kit.validReadTypes)

        document.getElementById('inputReads1').value = hotKit.defaultReads[0]
        document.getElementById('inputReads2').value = hotKit.defaultReads[1]

        $('#indexKitDrop').select2('destroy')
        $('#indexKitDrop').empty()
        $('#indexKitDrop').select2({
            data: hotKit.indexKits
        })

        reloadIndexes(hotKit.indexKits[0].kit)
    })

    // Handle switching between index kits 
    // loads appropriate i7 and i5 kits into dropdowns to remove clutter
    // does empty out all dropdown so if items are created they will be removed

    $('#indexKitDrop').on('select2:select', (e) => {

        // clean this up
        const value = e.params.data.id
        let kitData
        let foundKit = false
        hotKit.indexKits.forEach((x, i) => {
            if (foundKit) { return }
            if (x.id === value) {
                kitData = x.kit
                currentKit = x.kit
            }
        })

        // clears and reloads data in i7 and i5 index columns
        swapReadType(kitData.validReadTypes)
        reloadIndexes(kitData)

        // added incase lists were full and someone tried to 
        // readd something but it wouldnt let them bc in list already
        addedI7List = []
        addedI5List = []
        // can also choose not to add all items automatically rather than empty


    })



    // hey its not pretty but it works
    document.getElementById('add1MiseqRow').addEventListener('click', create_tr)
    document.getElementById('add5MiseqRow').addEventListener('click', () => {
        create_tr(); create_tr(); create_tr(); create_tr(); create_tr();
    })

    // auto pop with a few more rows
    create_tr(); create_tr(); create_tr(); create_tr(); create_tr();
    create_tr(); create_tr(); create_tr(); create_tr();

});



let samples = [];
let reads1 = 151;
let reads2 = 151;
let lrmaId = Math.floor(1000 + Math.random() * 9000);
export let miseqExpName = ""
let date = new Date().toISOString().split('T')[0];
let module = "";
let workflow = "";
let libPrepKit = "";
let indexKit = "";
let chemistry = "";
let readType = "paired"




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
        miSeqDynamicFile = hotKit.miSeqDynamicFile
    })
}

const getSamplesErrorsPromise = (samplesInput, metaData) => {
    console.log("starting get Samples errors promise", samplesInput)
    return new Promise((res, rej) => {
        getSamplesErrors(samplesInput, metaData, (data) => {
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
    module = document.getElementById('moduleDrop').value
    workflow = document.getElementById('workflowDrop').value
    libPrepKit = document.getElementById('libraryDrop').value
    indexKit = document.getElementById('indexKitDrop').value
    chemistry = document.getElementById('chemistryDrop').value
    readType = document.getElementById('readTypeSwitch').value


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
        readType: readType
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
    anyMiSeqErrors = await getSamplesErrorsPromise(samples, metaDataPackage)

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

    // make samplesheet (now makes dynamic sample sheet in same fxn)
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
* Sample Errors
*/
function getSamplesErrors(samplesIn, metaData, callback) {

    let internalErrors = false

    if (samplesIn.length <= 1) {
        alert('Please add samples', 'danger')
        internalErrors = true
        return;
    }

    let allSampleIds = []
    let allIndexWells = []
    let i7andi5Pairs = [] // paired
    let i7list = [] // single


    // check sample errors here
    samplesIn.forEach((x, i) => {
        if (i === 0) { return } // skip references

        if (!x[0]) {
            alert('Missing Sample_ID in Sample ' + (i + 1), 'danger')
            internalErrors = true
        }
        if (!x[3]) {
            alert('Missing I7 Index in Sample ' + (i + 1), 'danger')
            internalErrors = true
        }
        if (x[2] === 'None') {
            x[2] = ''
        }

        // add all ids to list
        allSampleIds.push(x[0])
        if (x[2] !== '') { allIndexWells.push(x[2]) }

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
        alert('Please make sure all Sample_IDs are unique', 'danger')
        internalErrors = true
    }

    if (allIndexWells.length !== _.uniq(allIndexWells).length && allIndexWells.length !== 0) {
        alert('Please make sure all Index_Plate_Wells are unique', 'danger')
        internalErrors = true
    }

    callback(internalErrors)
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
    $('.select2ClassIndexWell').select2('destroy')


    let table_body = document.getElementById('miseq_table_body'),
        first_tr = table_body.lastElementChild,
        tr_clone = first_tr.cloneNode(true);

    table_body.append(tr_clone);

    clean_last_tr(table_body.lastElementChild);

    $('.select2ClassIndexWell').select2({})

    $('.select2ClassAddMiSeq').select2({
        placeholder: 'None',
        tags: true
    })

    $('.select2ClassAddMiSeqI7').select2({
        placeholder: 'None',
        tags: true,
        createTag: (params) => indexCreateTag(params)
    })

    $('.select2ClassAddMiSeqI5').select2({
        placeholder: 'None',
        tags: true,
        createTag: (params) => indexCreateTag(params)
    })

    // initialize event listeners for new items
    addOptionI7Helper()
    addOptionI5Helper()
    handleIndexWell()

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
    addOptionI7(item)
    addOptionI7Helper()
});
$('.select2ClassAddMiSeqI5').on('select2:select', function (e) {
    let item = e.params.data.id
    addOptionI5(item)
    addOptionI5Helper()
});
$('.select2ClassAddMiSeqRef').on('select2:select', function (e) {
    let item = e.params.data.id
    addOptionRef(item)
});

// Event handler for index_plate_well that selects and 
// disables i7 and i5 indexes on selection
$('.select2ClassIndexWell').on('select2:select', function (e) {
    let item = e.params.data
    indexWellHandlerFxn(this, item)
    handleIndexWell()
});


function indexWellHandlerFxn(thisThing, item) {
    // console.log('this', thisThing)
    // console.log('item', item)
    // get values to select on indexes
    // console.log('indexWelGlobalPairs', indexWellGlobalPairs)
    // console.log(item)

    let i7Val = indexWellGlobalPairs[item.id].i7_well
    let i5Val = indexWellGlobalPairs[item.id].i5_well

    // select and disable input
    let i7Select = $(thisThing).closest('tr').children('td.sampI7Col').children('select').eq(0)
    let i5Select = $(thisThing).closest('tr').children('td.sampI5Col').children('select').eq(0)


    i7Select.val(i7Val)
    i7Select.trigger('change')
    i7Select.prop('disabled', true)

    i5Select.val(i5Val)
    i5Select.trigger('change')
    i5Select.prop('disabled', true)

    // add logic so when changed to 'None' it clears and undisables indexes
    if (item.id === 'None') {
        i7Select.prop('disabled', false)
        i5Select.prop('disabled', false)
    }


    // add logic so index_plate_well disables already selected wells
    // eh... can just add logic to check later -- done
}


// code for adding new tags to data in samplesheet table
let addedI7List = []
function addOptionI7(term) {

    if (addedI7List.includes(term)) { return }

    $('.select2ClassAddMiSeqI7').select2('destroy')
    $('.select2ClassAddMiSeqI7').select2({
        data: [{ "id": term, "text": term }],
        placeholder: 'None',
        tags: true,
        createTag: (params) => indexCreateTag(params)
    })
    addedI7List.push(term)

}

function addOptionI7Helper() {
    // clear all preexisting event handlers from class
    $('.select2ClassAddMiSeqI7').unbind('select2:select');

    // idk why this is needed her but it works
    $('.select2ClassAddMiSeqI7').on('select2:select', function (e) {
        let item = e.params.data.id
        addOptionI7(item)
        addOptionI7Helper()
    });
}

let addedI5List = []
function addOptionI5(term) {

    if (addedI5List.includes(term)) { return }

    $('.select2ClassAddMiSeqI5').select2('destroy')
    $('.select2ClassAddMiSeqI5').select2({
        data: [{ "id": term, "text": term }],
        placeholder: 'None',
        tags: true,
        createTag: (params) => indexCreateTag(params)
    })
    addedI5List.push(term)

}
function addOptionI5Helper() {
    // clear all preexisting event handlers from class
    $('.select2ClassAddMiSeqI5').unbind('select2:select');

    // idk why this is needed her but it works
    $('.select2ClassAddMiSeqI5').on('select2:select', function (e) {
        let item = e.params.data.id
        addOptionI5(item)
        addOptionI5Helper()
    });
}

function indexCreateTag(params) {

    if (!hotKit.isCustom) { return null } // dont make custom indexes outside of custom

    params.term = params.term.toUpperCase()
    // let currSeqLen = hotKit.indexKits[0].kit.sequence_length
    // if (currentKit) {
    //     currSeqLen = currentKit.sequence_length // ahh
    // }

    let regex = /^[ATGCN]+$/; // Not checking sequence length bc hypothetically it could be of any length
    // let regex = /^([ATGCN]{6,8})$/;
    let regexPass = regex.test(params.term)
    // if ((regexPass && libPrepKit === "Custom") || (regexPass && params.term.length == currSeqLen)) {
    if (regexPass) { // Not checking sequence length bc hypothetically it could be of any length
        return {
            id: params.term,
            text: params.term
        }
    }
    return null
}

let addedRefList = []
function addOptionRef(term) {

    if (addedRefList.includes(term)) { return }

    $('.select2ClassAddMiSeqRef').select2('destroy')
    $('.select2ClassAddMiSeqRef').select2({
        data: [{ "id": term, "text": term }],
        placeholder: 'None',
        tags: true
    })
    addedRefList.push(term)
    // idk why this is needed her but it works
    $('.select2ClassAddMiSeqRef').on('select2:select', function (e) {
        let item = e.params.data.id
        addOptionRef(item)
    });
}

function handleIndexWell() {

    // clear all preexisting event handlers from class
    $('.select2ClassIndexWell').unbind('select2:select');

    // reload the event listener on all elements in class
    $('.select2ClassIndexWell').on('select2:select', function (e) {
        let item = e.params.data
        indexWellHandlerFxn(this, item)
        handleIndexWell()
    });
}


let anyMiSeqErrors = false
/*
* Pulls all of sample information frome the table... 
* only pulls information from extra columns if title for those columns is filled in
*/
let miSeqTableVals = []
async function getAllMiSeqTableVals(callback) {

    miSeqTableVals = []
    anyMiSeqErrors = false

    let miSeqTableHeaders = []

    if (readType === 'paired') {
        miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project', 'Index_Plate_Well', 'Reference']
    } else {
        miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'Sample_Project', 'Index_Plate_Well', 'Reference']

    }

    // see if any of the extra fields were filled in
    let miseqExtra1Col = $('#miseq_extra_1').val().split(' ').join('_').split('-').join('_')
    let miseqExtra2Col = $('#miseq_extra_2').val().split(' ').join('_').split('-').join('_')
    let miseqExtra3Col = $('#miseq_extra_3').val().split(' ').join('_').split('-').join('_')

    let hasExtra1 = false
    let hasExtra2 = false
    let hasExtra3 = false

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

    // add headers to miSeqTableVals
    miSeqTableVals.push(miSeqTableHeaders)

    // get values
    let geet = $("#miseq_table_body tr").each(async function (x) {

        let rowVals = []

        let id = $(this).find(".sampId").val()
        let des = $(this).find(".sampDes").val()
        let indexWell = $(this).find(".indexWellInput").val()
        let i7 = $(this).find(".sampI7").val()
        let i5 = $(this).find(".sampI5").val()
        let proj = $(this).find(".sampProj").val()
        let ref = $(this).find(".sampRef option:selected").text()
        let ex1 = $(this).find(".sampEx1").val()
        let ex2 = $(this).find(".sampEx2").val()
        let ex3 = $(this).find(".sampEx3").val()

        // console.log('i7', $(this).find(".sampi7"))

        // if everything (important) is empty then just skip row
        if (!id && !i7 && !i5) { return }

        // clean certain characters
        id = id.split('-').join('_')
        id = id.split(' ').join('_')
        des.split(',').join(' ')
        proj = proj.split('-').join('_')
        proj = proj.split(' ').join('_')


        rowVals.push(id)
        rowVals.push(id) // sample name
        rowVals.push(des)
        rowVals.push(i7)
        rowVals.push(i7)
        if (readType === 'paired') {
            rowVals.push(i5)
            rowVals.push(i5)
        }
        rowVals.push(proj)
        if (libPrepKit !== "Custom") {
            rowVals.push(indexWell)
        }
        rowVals.push(ref)

        if (hasExtra1) { rowVals.push(ex1) }
        if (hasExtra2) { rowVals.push(ex2) }
        if (hasExtra3) { rowVals.push(ex3) }

        miSeqTableVals.push(rowVals)

    })

    $.when.apply(geet, miSeqTableVals).done(async () => {
        // console.log("starting geet promise")
        samples = miSeqTableVals
        callback(miSeqTableVals)
    })

}

// swap indexName and sequence in i7 and i5
let showSeqName = false
function swapIndexNameType() {

    // need some fxn to only display button when valid
    showSeqName = !showSeqName

    if (showSeqName) {
        $(".select2ClassAddMiSeqI7 option").each(() => {
            console.log('this', $(this))
            let val = $(this).val()
            $(this).html(`<option value="test"> test </option>`)

        })
        // console.log('hello')
        // // document.querySelectorAll('.select2ClassAddMiSeqI7 option, .select2ClassAddMiSeqI5 option').forEach(x => {
        // document.querySelectorAll('.select2ClassAddMiSeqI7 option').forEach(x => {
        //     if (x.value === '') { return }
        //     x.setAttribute('indexName', x.innerHTML) // x.getAttribute('indexName')
        //     x.innerHTML = x.value
        // })
        // document.querySelectorAll('.select2ClassAddMiSeqI5 option').forEach(x => {
        //     if (x.value === '') { return }
        //     x.setAttribute('indexName', x.innerHTML) // x.getAttribute('indexName')
        //     x.innerHTML = x.value
        // })
    } else {
        // // document.querySelectorAll('.select2ClassAddMiSeqI7 option, .select2ClassAddMiSeqI5 option').forEach(x => {
        //     document.querySelectorAll('.select2ClassAddMiSeqI7 option').forEach(x => {
        //         if (x.value === '') { return }
        //         x.innerHTML = x.getAttribute('indexName')
        //     })
        //     document.querySelectorAll('.select2ClassAddMiSeqI5 option').forEach(x => {
        //         if (x.value === '') { return }
        //         x.innerHTML = x.getAttribute('indexName')
        //         if (x.getAttribute('indexName') === '') { x.innerHTML = 'broken'}

        //     })
    }

}

// reloads indexes with values from kits
function reloadIndexes(kitData) {

    $('.select2ClassAddMiSeqI5').prop('disabled', false)
    $('.select2ClassAddMiSeqI7').prop('disabled', false)

    // reload I7 index column
    $('.select2ClassAddMiSeqI7').select2('destroy')
    $('.select2ClassAddMiSeqI7').empty()
    $('.select2ClassAddMiSeqI7').select2({
        data: kitData.i7Barcodes,
        tags: true,
        createTag: (params) => indexCreateTag(params)
    })

    addOptionI7()
    // reload I5 index column when applicable
    if (kitData.i5Barcodes) {
        $('.select2ClassAddMiSeqI5').select2('destroy')
        $('.select2ClassAddMiSeqI5').empty()
        $('.select2ClassAddMiSeqI5').select2({
            data: kitData.i5Barcodes,
            tags: true,
            createTag: (params) => indexCreateTag(params)
        })
        addOptionI5Helper()
    }

    // load index well column when applicable
    if (kitData.indexWellPairs) {

        document.querySelectorAll('.indexWellCol').forEach(x => x.style.display = 'block')
        // document.querySelectorAll('.laneCol').forEach(x => x.style.display = 'block')

        $('.select2ClassIndexWell').select2('destroy')
        $('.select2ClassIndexWell').empty()
        $('.select2ClassIndexWell').select2({
            placeholder: 'None',
            data: kitData.indexWellPairs
        })

        kitData.indexWellPairs.forEach(x => {
            if (x.id === '') { return }
            indexWellGlobalPairs[x.id] = x
        })

        handleIndexWell()
    } else {

        document.querySelectorAll('.indexWellCol').forEach(x => x.style.display = 'none')
        // document.querySelectorAll('.laneCol').forEach(x => x.style.display = 'none')

        $('.select2ClassIndexWell').select2('destroy')
        $('.select2ClassIndexWell').empty()
        $('.select2ClassIndexWell').select2({
            placeholder: 'None'
        })
    }

}


function swapReadType(value) {
    // change options in select to reflect options of hotKit
    $('#readTypeSwitch').select2('destroy')
    $('#readTypeSwitch').empty()
    switch (value) {
        case 'both':
            $('#readTypeSwitch').select2({
                data: [{ "id": 'single', 'text': 'Single' }, { "id": 'paired', 'text': 'Paired' }]
            })
            value = 'paired' // default to paired on select
            break;

        case 'single':
            $('#readTypeSwitch').select2({
                data: [{ "id": 'single', 'text': 'Single' }]
            })
            break;

        case 'paired':
            $('#readTypeSwitch').select2({
                data: [{ "id": 'paired', 'text': 'Paired' }]
            })
            break;
    }

    $('#readTypeSwitch').val(value)
    $('#readTypeSwitch').trigger('change')
    $('#readTypeSwitch').trigger({
        type: 'select2:select',
        params: {
            data: { 'id': value, 'text': value }
        }
    });

}

function addMiSeqCol() {
    if (addMiSeqColCounter === 3) {
        alert('Sorry you can not add more than 3 extra columns at this moment', 'warning')
        return;
    }
    addMiSeqColCounter++
    console.log('counter', addMiSeqColCounter)
    if (addMiSeqColCounter === 1) {
        $('.extraCol1').show()
    }
    if (addMiSeqColCounter === 2) {
        $('.extraCol2').show()
    }
    if (addMiSeqColCounter === 3) {
        $('.extraCol3').show()
    }
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
