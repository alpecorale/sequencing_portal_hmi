

$(document).ready(function () {

    // initialize pop overs
    $('.nanoporeSampleSheetInfo').popover({
        container: 'body',
        content: "Upload your nanopore samplesheet."
    })
    

    // event listeners onto buttons and inputs
    document.getElementById('nanoExperimentName').addEventListener('input', noSpecialChars)


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