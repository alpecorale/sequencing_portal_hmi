
let addNanoColCounter = 0
export let bypassRef = false

$(document).ready(function () {

    // initialize pop overs
    $('.nanoporeSampleSheetInfo').popover({
        container: 'body',
        content: "Upload your nanopore samplesheet."
    })
    $('.multiplexKitInfo').popover({
        container: 'body',
        content: "Multiplex Kit Info."
    })
    // $('.constructInfo').popover({
    //     container: 'body',
    //     content: "Construct Info."
    // })
    // $('.capsidInfo').popover({
    //     container: 'body',
    //     content: "Capsid Info."
    // })
    $('.nanoExtraInfo').popover({
        container: 'body',
        content: "Add additional sample information here. Ex: Cell_Type, Polarity, idk"
    })
    // initialize select2 boxes
    $('.select2ClassNano').select2({
        placeholder: 'None' // ,
        // tags: true
    })
    $('.select2ClassAddNano').select2({
        placeholder: 'None',
        tags: true
    })


    // event listeners onto buttons and inputs
    $(".extraNCol1, .extraNCol2, .extraNCol3").hide()
    document.getElementById('addNanoCol').addEventListener('click', addNanoCol)


    // document.getElementById('nanoExperimentName').addEventListener('input', noSpecialChars)
    document.getElementById('inputFlowcellID').addEventListener('input', noSpecialChars)
    // document.getElementById('inputLibraryName').addEventListener('input', noSpecialChars)
    let briefDesList = document.getElementsByClassName('nanoBriefFldrDes')
    Array.from(briefDesList).forEach(x => {
        x.addEventListener('input', noSpecialChars)
    })

    // let constructList = document.getElementsByClassName('nanoConstruct')
    // Array.from(constructList).forEach(x => {
    //     x.addEventListener('input', noSpecialChars)
    // })

    let sampNameList = document.getElementsByClassName('nanoSampName')
    Array.from(sampNameList).forEach(x => {
        x.addEventListener('input', noSpecialChars)
    })

    let rm_row_btns = document.querySelectorAll('.rm-row-btn-n')
    Array.from(rm_row_btns).forEach(x => {
        // x.addEventListener('click', () => remove_tr_nano(this))
        x.addEventListener('click', remove_tr_nano)
    })
    let sampIds = document.querySelectorAll('.nanoSampId')
    Array.from(sampIds).forEach(x => {
        x.addEventListener('input', noSpecialChars)
    })

    document.getElementById('inputInitialQC').addEventListener('input', numbersOnly)


    // hide projects
    $('#project2Row').hide()
    $('#project3Row').hide()
    $('#project4Row').hide()
    $('#project5Row').hide()

    let counter = 1
    document.getElementById('add1NanoProjRow').addEventListener('click', () => {
        if (counter <= 5) {
            counter++
            $('#project' + counter + 'Row').show()
            $('.nanoSampProj option[value="Project ' + counter + '"]').prop('disabled', false);

        }
        if (counter == 5) {
            $('#add1NanoProjRow').hide()
        }

    })


    // hey its not pretty but it works
    document.getElementById('add1NanoRow').addEventListener('click', create_tr_nano)
    document.getElementById('add5NanoRow').addEventListener('click', () => {
        create_tr_nano(); create_tr_nano(); create_tr_nano(); create_tr_nano(); create_tr_nano();
    })

    // auto pop with a few more rows
    create_tr_nano(); create_tr_nano(); create_tr_nano();
    create_tr_nano(); create_tr_nano(); create_tr_nano();

    // // trigger autoselect proj once and only once
    // $('.select2ClassNanoProj').val('Project 1')
    // $('.select2ClassNanoProj').trigger('change')

    // autofill Brief Folder Description??

});

async function getExpName() {
    let temp_nanoExpName = ""
    if (document.getElementById('inputExperimentalistNano').value == "jira_api") {
        temp_nanoExpName = await fetch('/nanoIndexNumber?testing=true', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                const latestIssueKey = data.key;
                return latestIssueKey
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        temp_nanoExpName = await fetch('/nanoIndexNumber', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                const latestIssueKey = data.key;
                return latestIssueKey
            })
            .catch(error => {
                console.error(error);
            });

    }
    temp_nanoExpName = temp_nanoExpName.split('-')[0] + (parseInt(temp_nanoExpName.split('-')[1]) + 1)
    return temp_nanoExpName
}

document.getElementById('inputFilterReadsSwitch').addEventListener('change', () => {
    if (document.getElementById('filterReadsHideDiv').style.display === 'block') {
        document.getElementById('filterReadsHideDiv').style.display = 'none'
        addFilter = false
    } else {
        document.getElementById('filterReadsHideDiv').style.display = 'block'
        addFilter = true
    }
})

// inputExperimentalist Parity
$('#inputExperimentalistNano').on('select2:select', () => {
    if (!document.getElementById('inputExperimentalist').value) {
        $('#inputExperimentalist').val(document.getElementById('inputExperimentalistNano').value).trigger('change').trigger("select2:select")
    }
})

$('#inputExperimentalist').on('select2:select', () => {
    if (!document.getElementById('inputExperimentalistNano').value) {
        $('#inputExperimentalistNano').val(document.getElementById('inputExperimentalist').value).trigger('change').trigger("select2:select")
    }
})

// mplexKit.autoSelect?
// $('.multiplexKitInput').on('select2:select', () => {
//     if (!document.getElementById('inputExperimentalist').value) {
//         $('#inputExperimentalist').val(document.getElementById('inputExperimentalistNano').value).trigger('change')
//     }
// })


// input variables for samplesheet
let samples
let projects
let basecallerVersion = "";
let basecallerMode = "";
let flowcellID = "";
let initialQC = ''
let experimentalistNano = "";
// let libraryName = "";
let addFilter = true;
let filterReadsMin = "";
let filterReadsMinQual = "";
let date = new Date().toISOString().split('T')[0];
export let nanoExpName = ''
export let nanoporeSampleSheetToPass = new FormData()
export let filePathSamp = ""
let anyNanoErrors = false
let p1mplx = ""
let p2mplx = ""
let p3mplx = ""
let p4mplx = ""
let p5mplx = ""

export let startCmd = 'echo hello > somethingBroke.txt'


// switch to stop jira ticket creation if samplesheet fails
export let nanoSampleSheetCreationSuccess = true;

const getAllNanoporeTableValsPromise = () => {

    return new Promise((resolve, reject) => {
        getAllNanoporeTableVals((data) => {
            console.log('end of get all table vals promise', samples)
            resolve(data)
        })
    })
}

const getAllNanoporeProjectTableValsPromise = () => {

    return new Promise((resolve, reject) => {
        getAllNanoporeProjectTableVals((data) => {
            console.log('end of get all table vals promise', projects)
            resolve(data)
        })
    })
}

export const handleNanoporeSampleSheetPromise = () => {
    console.log('Starting handle Nanopore SampleSheet Promise')
    return new Promise((res, rej) => {
        handleNanoporeSampleSheet((data) => {
            console.log("Finished handle nanopore sample sheet promise")
            res(data)
        })
    })
}

const makeNanoporeSampleSheetPromise = (samplesList, projectsList, metaData) => {
    console.log("Starting make Nanopore Sample sheet promise", samples)
    return new Promise((res, rej) => {
        makeNanoporeSampleSheet(samplesList, projectsList, metaData, (data) => {
            console.log("Finish make Nanopore Sample sheet promise", samples)
            res(data)
        })
    })
}

const getSamplesErrorsPromise = (samplesInput, projectsInput, metaData) => {
    console.log("starting get Samples errors promise", samplesInput)
    return new Promise((res, rej) => {
        getSamplesErrors(samplesInput, projectsInput, metaData, (data) => {
            res(data)
        })
    })
}


/*
*
*   Nanopore handle
*/
async function handleNanoporeSampleSheet(callback) {

    // get values from form
    nanoExpName = await getExpName()

    experimentalistNano = document.getElementById('inputExperimentalistNano').value
    basecallerVersion = document.getElementById('inputBasecallerVersion').value
    basecallerMode = document.getElementById('inputBasecallerMode').value
    flowcellID = document.getElementById('inputFlowcellID').value
    initialQC = document.getElementById('inputInitialQC').value
    // libraryName = document.getElementById('inputLibraryName').value



    let metaDataPackage = {
        nanoExpName: nanoExpName,
        experimentalistNano: experimentalistNano,
        date: date,
        basecallerVersion: basecallerVersion,
        basecallerMode: basecallerMode,
        flowcellID: flowcellID,
        initialQC: initialQC
        // libraryName: libraryName
    }

    if (addFilter) {
        filterReadsMin = document.getElementById('inputFilterMinLength').value
        filterReadsMinQual = document.getElementById('inputFilterMinQuality').value

        metaDataPackage.filterReadsMin = filterReadsMin
        metaDataPackage.filterReadsMinQual = filterReadsMinQual
    }

    // // set set samples from table
    samples = [] // empty sample array for mistakes
    projects = {}

    let errors = false;

    await getAllNanoporeProjectTableValsPromise()
    await getAllNanoporeTableValsPromise()

    // Check if required fields are populated correctly
    if (!nanoExpName) {
        alert('Please add Experiment Name!', 'danger')
        errors = true
    }

    if (!flowcellID) {
        alert('Please add Flowcell ID!', 'danger')
        errors = true
    }

    // if (!initialQC) {
    //     alert('Please add intialQC', 'danger')
    //     errors = true
    // }

    if (!experimentalistNano) {
        alert('Please add Nanopore Experimentalist!', 'danger')
        errors = true
    }

    console.log(samples)
    // fix simple errors and type check etc
    anyNanoErrors = await getSamplesErrorsPromise(samples, projects, metaDataPackage)


    if (errors || anyNanoErrors) {
        nanoSampleSheetCreationSuccess = false
        return;
    }


    nanoporeSampleSheetToPass = new FormData()

    // make samplesheet
    await makeNanoporeSampleSheetPromise(samples, projects, metaDataPackage)

    // attach samplesheet to folder
    // maybe want a seperate fxn/location for download? idk
    await fetch("/downloadNanoSampleSheet", {
        method: "POST",
        body: nanoporeSampleSheetToPass,
    }).catch((error) => ("Something went wrong!", error));

    // // old way of downloading sample sheet directly to user
    // let csvUrl = 'http://srv-app-11:3000/' + nanoExpName + '_SampleSheet.xlsx';

    // let hiddenElement = document.createElement('a');
    // hiddenElement.href = csvUrl;
    // hiddenElement.target = '_blank';
    // hiddenElement.click();

    // this gets passed to csvPass in newScript and used to upload the file to Jira
    filePathSamp = nanoExpName + '_SampleSheet.xlsx'

    callback(true)

} // end of handle nanopore samplesheet

let nanoTableVals = []
async function getAllNanoporeTableVals(callback) {

    nanoTableVals = []
    anyNanoErrors = false

    // see if any of the extra fields were filled in
    let nanoExtra1Col = $('#nano_extra_1').val().split(' ').join('_').split('-').join('_')
    let nanoExtra2Col = $('#nano_extra_2').val().split(' ').join('_').split('-').join('_')
    let nanoExtra3Col = $('#nano_extra_3').val().split(' ').join('_').split('-').join('_')

    // get values
    let geet = $("#nano_table_body tr").each(async function (x) {

        let rowVals = {}

        let id = $(this).find(".nanoSampName").val()
        // let mplxKit = $(this).find(".multiplexKitInput").val()
        // let barcodeNum = $(this).find(".barcodeNumInput").val()
        let barcodeNum = $(this).find(".barcodeNumInput").val()
        //document.getElementById('barcodeNumInput').value
        let projNum = $(this).find(".nanoSampProj").val()
        // let constructId = $(this).find(".nanoConstruct").val()
        // let capsid = $(this).find(".nanoCapsid").val()
        let ex1 = $(this).find(".nanoSampEx1").val()
        let ex2 = $(this).find(".nanoSampEx2").val()
        let ex3 = $(this).find(".nanoSampEx3").val()

        // get mplxKit based on project
        let mplxKit = ''
        switch (projNum) {
            case 'Project 1':
                mplxKit = p1mplx
                break;
            case 'Project 2':
                mplxKit = p2mplx
                break;
            case 'Project 3':
                mplxKit = p3mplx
                break;
            case 'Project 4':
                mplxKit = p4mplx
                break;
            case 'Project 5':
                mplxKit = p5mplx
                break;
        }

        // if everything (important) is empty then just skip row
        if (!id && !barcodeNum) { return }

        // clean certain characters
        id = id.split('-').join('_')
        id = id.split(' ').join('_')

        if (barcodeNum < 10) {
            barcodeNum = "Barcode0" + barcodeNum
        } else {
            barcodeNum = "Barcode" + barcodeNum
        }

        rowVals.id = id
        rowVals.mplxKit = mplxKit
        rowVals.projNum = projNum
        rowVals.barcodeNum = barcodeNum
        // rowVals.constructId = constructId
        // rowVals.capsid = capsid

        if (nanoExtra1Col) { rowVals.ex1 = ex1 }
        if (nanoExtra2Col) { rowVals.ex2 = ex2 }
        if (nanoExtra3Col) { rowVals.ex3 = ex3 }

        nanoTableVals.push(rowVals)

    })

    $.when.apply(geet, nanoTableVals).done(async () => {
        // console.log("starting geet promise")
        samples = nanoTableVals
        callback(nanoTableVals)
    })

}

let nanoProjTableVals = {}
async function getAllNanoporeProjectTableVals(callback) {

    nanoProjTableVals = {}
    anyNanoErrors = false

    // get values
    let geet = $("#nano_project_table_body tr").each(async function (index) {

        let rowVals = {}

        let hmiProj = $(this).find(".nanoHMIProj").val()
        let program = $(this).find(".nanoProgram").val()
        let briefDes = $(this).find(".nanoBriefFldrDes").val()
        let des = $(this).find(".nanoSampDes").val()
        let ref = $(this).find(".nanoSampRef").val()

        // if everything (important) is empty then just skip row
        if (!hmiProj && !program && !briefDes) { return }

        // clean certain characters
        briefDes = briefDes.split(' ').join('_')


        rowVals.hmiProj = hmiProj
        rowVals.program = program
        rowVals.briefDes = briefDes
        rowVals.des = des
        rowVals.ref = ref
        let tempFullName = "Project_" + hmiProj + "_" + program + "_" + briefDes
        rowVals.fullName = tempFullName.split(" ").join("_").split("-").join("_")

        let tempprojName = 'Project' + (index + 1)

        // set multiplex kits
        switch (index + 1) {
            case 1:
                p1mplx = $(this).find(".multiplexKitInput").val()

            case 2:
                p2mplx = $(this).find(".multiplexKitInput").val()

            case 3:
                p3mplx = $(this).find(".multiplexKitInput").val()

            case 4:
                p4mplx = $(this).find(".multiplexKitInput").val()

            case 5:
                p5mplx = $(this).find(".multiplexKitInput").val()
        }


        nanoProjTableVals[tempprojName] = rowVals

    })

    $.when.apply(geet, nanoProjTableVals).done(async () => {
        // console.log("starting geet promise")
        projects = nanoProjTableVals
        callback(nanoProjTableVals)
    })

}


// make SampleSheet and live basecalling cmd
async function makeNanoporeSampleSheet(samplesList, projectsList, metaData, callback) {

    let nanoJSON = {
        expName: metaData.nanoExpName,
        date: metaData.date,
        experimentalistNano: experimentalistNano,
        basecaller: basecallerVersion,
        basecallerMode: basecallerMode,
        flowcellID: flowcellID,
        initialQC: initialQC,
        // libraryName: metaData.libraryName,
        filterReadsMin: filterReadsMin,
        filterReadsMinQual: filterReadsMinQual,
        projects: projectsList,
        samples: samplesList
    }

    // Make the Live basecalling cmd
    let testing = false
    if (testing) {
        let tempInputDir = metaData.nanoExpName // NANOSEQ-1
        let tempOutputDir = 'set by live basecaller'
        let tempModel = basecallerMode
        let tempStopTime = '5' // probably change to 180 for prod
        let tempBatchSize = '20' // idk

        startCmd = 'conda activate /software/compbio/mambaforge/envs/bfx-gpu/ && python /grid/home/apecorale/LiveBascallingTesting/MinION-desktop/dorado_basecall.py -i '
        startCmd = startCmd + tempInputDir
        startCmd = startCmd + ' -o ' + tempOutputDir
        startCmd = startCmd + ' --barcodes none --model ' + tempModel
        startCmd = startCmd + ' --stop_time ' + tempStopTime
        startCmd = startCmd + ' --batch_size ' + tempBatchSize
        startCmd = startCmd + ' --portal '
        startCmd = startCmd + ' > test_out.txt'

    }


    // Add to MasterDB
    let mastData = {
        id: metaData.nanoExpName,
        run_date: metaData.date,
        flowcell: flowcellID,

    }
    fetch('/addMasterDB', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mastData)
    })
        .then(response => {
            if (response.ok) {
                console.log('Data added to the database successfully.');
                // Perform any additional actions if needed
            } else {
                console.error('Failed to add data to the database.');
                // Handle the error if needed
            }
        })
        .catch(error => console.error(error));


    // let fileName = nanoJSON.expName + '_' + nanoJSON.date.split('-').join('_') + '_SampleSheet.json'
    let fileName = nanoJSON.expName + '_SampleSheet.json'
    let jsonize = JSON.stringify(nanoJSON)
    let jsonSampleSheetNanoData = new Blob([jsonize], { type: 'application/json' });

    // need to grab this later
    nanoporeSampleSheetToPass.append('file', new File([jsonSampleSheetNanoData], fileName))

    // // old way of downloading sample sheet directly to user
    // let csvUrl = URL.createObjectURL(jsonSampleSheetNanoData);
    // let hiddenElement = document.createElement('a');
    // hiddenElement.href = csvUrl;
    // hiddenElement.target = '_blank';
    // hiddenElement.download = fileName; // edit this to properly name the sample sheet
    // hiddenElement.click();

    callback(true)
}

/*
* Sample Errors
*/
function getSamplesErrors(samplesIn, projectsIn, metaData, callback) {

    let internalErrors = false

    if (samplesIn.length < 1) {
        alert('Please add samples', 'danger')
        internalErrors = true
        return;
    }

    let allSampleIds = []
    let allCreatedProjects = Object.keys(projectsIn)
    let mplxKit1 = []
    let mplxKit2 = []

    allCreatedProjects = allCreatedProjects.map(x => { return x.slice(-1) })
    // check sample errors here
    samplesIn.forEach((x, i) => {
        allSampleIds.push(x.id)

        // if (!x.id || !x.projNum || !x.barcodeNum || !x.mplxKit) {
        if (!x.id || !x.projNum || !x.barcodeNum) {
            alert('Sample Number ' + (i + 1) + ' is missing required information', 'danger')
            internalErrors = true
        }

        if (!allCreatedProjects.includes(x.projNum.slice(-1))) {
            alert('Sample Number ' + (i + 1) + ' assigned project is missing', 'danger')
            internalErrors = true
        }

        // handle errors for mplxKits barcodes 1-12
        if (x.barcodeNum.slice(-2) <= 12) {
            mplxKit1.push(x.mplxKit)
        }
        // handle errors for mplxKits barcodes 12-24
        if (x.barcodeNum.slice(-2) > 12 & x.barcodeNum.slice(-2) <= 24) {
            mplxKit2.push(x.mplxKit)
        }

        if (x.barcodeNum.slice(-2) > 24) {
            alert('Sample Number ' + (i + 1) + ' barcode number should be less then 24', 'danger')
            internalErrors = true
        }
    })

    if (_.uniq(mplxKit1).length > 1) {
        alert('Barcodes 1-12 must all use the same Multiplex Kit', 'danger')
        internalErrors = true
    }
    if (_.uniq(mplxKit2).length > 1) {
        alert('Barcodes 12-24 must all use the same Multiplex Kit', 'danger')
        internalErrors = true
    }

    // check all project errors here
    Object.keys(projectsIn).forEach((x, i) => {
        if (!projectsIn[x].hmiProj || !projectsIn[x].program || !projectsIn[x].briefDes) {
            alert('Project Number ' + (i + 1) + ' is missing required information', 'danger')
            internalErrors = true
        }
        let temp_val = i + 1
        switch (temp_val) {
            case 1:
                if (!p1mplx) {
                    alert('Project Number ' + (i + 1) + ' is missing multiplex kit', 'danger')
                    internalErrors = true
                }
                break;

            case 2:
                if (!p2mplx) {
                    alert('Project Number ' + (i + 1) + ' is missing multiplex kit', 'danger')
                    internalErrors = true
                }
                break;

            case 3:
                if (!p3mplx) {
                    alert('Project Number ' + (i + 1) + ' is missing multiplex kit', 'danger')
                    internalErrors = true
                }
                break;

            case 4:
                if (!p4mplx) {
                    alert('Project Number ' + (i + 1) + ' is missing multiplex kit', 'danger')
                    internalErrors = true
                }
                break;

            case 5:
                if (!p5mplx) {
                    alert('Project Number ' + (i + 1) + ' is missing multiplex kit', 'danger')
                    internalErrors = true
                }
                break;

        }
    })


    // check that all sample_Ids and names are unique
    if (allSampleIds.length !== _.uniq(allSampleIds).length) {
        alert('Please make sure all Sample Names are unique', 'danger')
        internalErrors = true
    }


    callback(internalErrors)
}


/*
*
* Nano Table
*
*/
function addNanoCol() {
    if (addNanoColCounter === 3) {
        alert('Sorry you can not add more than 3 extra columns at this moment', 'warning')
        return;
    }
    addNanoColCounter++
    if (addNanoColCounter === 1) {
        $('.extraNCol1').show()
    }
    if (addNanoColCounter === 2) {
        $('.extraNCol2').show()
    }
    if (addNanoColCounter === 3) {
        $('.extraNCol3').show()
    }
}

/*
* Fxn makes table row
*/
function create_tr_nano() {

    $('.select2ClassNano').select2('destroy')


    let table_body = document.getElementById('nano_table_body'),
        first_tr = table_body.lastElementChild,
        tr_clone = first_tr.cloneNode(true);

    table_body.append(tr_clone);

    clean_last_tr_nano(table_body.lastElementChild);

    $('.select2ClassNano').select2({
        placeholder: 'None' // ,
        // tags: true
    })

    // trigger autoselect proj where values are empty once and only once
    $('.select2ClassNanoProj').filter((x, y) => {
        if (!y.value) {
            return y
        }
    }).val('Project 1').trigger('change')

    // Re add event listeners everywhere
    let rm_row_btns = document.querySelectorAll('.rm-row-btn-n')
    Array.from(rm_row_btns).forEach(x => {
        // x.addEventListener('click', () => remove_tr_nano(this))
        x.addEventListener('click', remove_tr_nano)
        x.myParam = 'this'
    })
    let sampIds = document.querySelectorAll('.nanoSampId')
    Array.from(sampIds).forEach(x => {
        x.addEventListener('input', noSpecialChars)
    })


}

/*
* Helper fxn to clean the newly created row
*/
function clean_last_tr_nano(lastTr) {
    let children = lastTr.children;

    children = Array.isArray(children) ? children : Object.values(children);
    children.forEach((x, i) => {
        // clear all inputs
        if (x !== lastTr.lastElementChild && i !== 0) {
            x.firstElementChild.value = '';
        }
        // // set row number
        // if (i === 0) {
        //     let rowNum = parseInt(x.innerText)
        //     rowNum = rowNum + 1
        //     x.innerText = rowNum
        // }

    });
}

/*
* Fxn to delete table row
*/
function remove_tr_nano() {

    if (this === undefined) { return }
    if (this.closest('tbody').childElementCount == 1) {
        alert("You don't have permission to delete this", "warning");
    } else {
        this.closest('tr').remove();

        // // and renumber everything
        // let rowNum = 1
        // $("#nano_table_body tr").each(function () {
        //     $(this).children(":first").text(rowNum)
        //     rowNum++
        // })
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


const delay = ms => new Promise(res => setTimeout(res, ms));


// no special characters
function noSpecialChars(e) {
    let input = e.target
    //let regex = /[^a-z]/gi; only allows letters
    let regex = /[!@#$%^&*()/?:;[\]'"{},.`~=+\\]/gi; // allows anything but these characters
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
    input.value = input.value.replace(regex, "")
}