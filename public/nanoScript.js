

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
    $('.constructInfo').popover({
        container: 'body',
        content: "Construct Info."
    })
    $('.capsidInfo').popover({
        container: 'body',
        content: "Capsid Info."
    })
    
    // initialize select2 boxes
    $('.select2ClassNano').select2({
        placeholder: 'None' // ,
        // tags: true
    })

    // event listeners onto buttons and inputs
    document.getElementById('nanoExperimentName').addEventListener('input', noSpecialChars)
    let rm_row_btns = document.querySelectorAll('.rm-row-btn')
    Array.from(rm_row_btns).forEach(x => {
        // x.addEventListener('click', () => remove_tr(this))
        x.addEventListener('click', remove_tr)
    })
    let sampIds = document.querySelectorAll('.nanoSampId')
    Array.from(sampIds).forEach(x => {
        x.addEventListener('input', noSpecialChars)
    })

    // hey its not pretty but it works
    document.getElementById('add1NanoRow').addEventListener('click', create_tr)
    document.getElementById('add3NanoRow').addEventListener('click', () => {
        create_tr(); create_tr(); create_tr();
    })
    document.getElementById('add5NanoRow').addEventListener('click', () => {
        create_tr(); create_tr(); create_tr(); create_tr(); create_tr();
    })

    // auto pop with a few more rows
    create_tr(); create_tr(); create_tr(); create_tr(); create_tr();
    create_tr(); create_tr(); create_tr(); create_tr(); create_tr();


});


export let nanoExpName = ''
export let nanoDynamicFile = ''
// switch to stop jira ticket creation if samplesheet fails
export let nanoSampleSheetCreationSuccess = true;

export const handleNanoporeSampleSheetPromise = () => {
    console.log('Starting handle Nanopore SampleSheet Promise')
    return new Promise((res, rej) => {
        handleNanoporeSampleSheet((data) => {
            console.log("Finished handle nanopore sample sheet promise")
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
    nanoExpName = document.getElementById('nanoExperimentName').value


    // // set set samples from table
    // samples = [] // empty sample array for mistakes

    let errors = false;

    // // samples = await getAllMiSeqTableValsPromise()
    // await getAllMiSeqTableValsPromise()

    // Check if required fields are populated correctly
    if (!nanoExpName) {
        alert('Please add Experiment Name!', 'danger')
        errors = true
    }

    // // fix simple errors and type check etc
    // anyMiSeqErrors = await getSamplesErrorsPromise()


    if (errors) {
    //if (errors || anyMiSeqErrors) {
        nanoSampleSheetCreationSuccess = false
        return;
    }

    nanoExpName = nanoExpName.split('-').join('_') // replace - with _

    // // make dynamic sample sheet
    // await makeDynamicSampleSheetPromise(samples)

    // // make samplesheet
    // await makeMiseqSampleSheetPromise(samples)

    const rawFile = document.getElementById('inputNanoporeSampleSheet').files // rawFile

    let nanoporeSampleSheetToPass = new FormData()

    Array.from(rawFile).forEach(x => {
        nanoDynamicFile = x // this one gets sent to newscript then jira
        nanoporeSampleSheetToPass.append('file', x) // this one gets saved on server
    })
    

    // attach samplesheet to folder
    // maybe want a seperate fxn/location for download? idk
    await fetch("/downloadSampleSheet", {
        method: "POST",
        body: nanoporeSampleSheetToPass,
    }).catch((error) => ("Something went wrong!", error));

    callback(true)

}




/*
*
* Nano Table
*
*/

/*
* Fxn makes table row
*/
function create_tr() {

    $('.select2ClassNano').select2('destroy')

    let table_body = document.getElementById('nano_table_body'),
        first_tr = table_body.lastElementChild,
        tr_clone = first_tr.cloneNode(true);

    table_body.append(tr_clone);

    clean_last_tr(table_body.lastElementChild);

    $('.select2ClassNano').select2({
        placeholder: 'None' // ,
        // tags: true
    })


    // Re add event listeners everywhere
    let rm_row_btns = document.querySelectorAll('.rm-row-btn')
    Array.from(rm_row_btns).forEach(x => {
        // x.addEventListener('click', () => remove_tr(this))
        x.addEventListener('click', remove_tr)
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
        $("#nano_table_body tr").each(function () {
            $(this).children(":first").text(rowNum)
            rowNum++
        })
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