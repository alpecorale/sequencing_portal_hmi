

$(document).ready(function () {

    // initialize pop overs
    $('.indexInfo').popover({
        container: 'body',
        content: "Add Indexes here"
    })
    $('.sampleSheetRefInfo').popover({
        container: 'body',
        content: "Input name of reference if using multiple references. Please attach reference files below"
    })
    $('.extraInfo').popover({
        container: 'body',
        content: "Add additional sample information here. Ex: Cell_Type, Polarity, idk"
    })
    $('.helpfulInfo').popover({
        container: 'body',
        content: "Tip 1: You can write your own options in, if select box is missing what you need. Tip 2: Let me know if these boxes are missing something and I can add it to the list. apecorale@homologymedicines.com"
    })
    $('.assigneeInfo').popover({
        container: 'body',
        content: "Who do you want to assign the ticket to: Yourself?, Other Researcher?"
    })
    $('.watcherInfo').popover({
        container: 'body',
        content: "Who do you want to add as a watcher for ticket?"
    })
    $('.projectInfo').popover({
        container: 'body',
        content: "What Project is this ticket attached to?"
    })
    $('.tagsInfo').popover({
        container: 'body',
        content: "Want to add any tags to your ticket? They can be helpful in sorting downstream analysis. Feel free to make new tags as needed."
    })
    $('.categoryInfo').popover({
        container: 'body',
        content: "What Category is this ticket? Generally want to put sequencing runs under Sequencing category. Epics are typically reserverd for larger over arching projects."
    })
    $('.assignEpicInfo').popover({
        container: 'body',
        content: "Does this ticket belong under a bigger project (Epic) or is it independent?"
    })
    $('.linkedIssueInfo').popover({
        container: 'body',
        content: "Does this ticket have any relationship with other tickets? Ex: Is it blocked by another?"
    })
    $('.referenceInfo').popover({
        container: 'body',
        content: "Be a pal and upload your references. Select from file system or from previously uploaded list."
    })
    $('.otherAttachmentsInfo').popover({
        container: 'body',
        content: "Any other helpful files or data you want to attach to ticket, add it here"
    })

    // initialize select2 boxes
    $('.select2Class').select2();
    $('.select2ClassClear').select2({
        placeholder: 'None',
        allowClear: true
    })
    $('.select2ClassAdd').select2({
        tags: true
    })
    $('.select2ClassAddMiSeq').select2({
        placeholder: 'None',
        tags: true
    })
    $("#inputLinkedIssue").prop("disabled", true)

    create_tr('miseq_table_body')
    create_tr('miseq_table_body')
    create_tr('miseq_table_body')
    create_tr('miseq_table_body')
});

// console.log('d3', d3.version)
console.log('lo', _.VERSION)

// d3.csv('nanoporeFolders.csv', (data) => {
//     console.log(data)
// });

let typeOfSeq = 'MISEQ';
let jiraTicketID = '';
let samples = [];
let sequencingInfo = '';
let experimentalist = ''; // Assignee
let stakeholders = []; // Watchers
let reads1 = 151; // miseq
let reads2 = 151; // miseq
let lrmaId = 10000 // miseq
let expName = "" // miseq
let date = new Date();
let module = ""; // miseq
let workflow = ""; // miseq
let libPrepKit = ""; // miseq
let indexKit = ""; // miseq
let chemistry = ""; // miseq
let inputTagsArray = [];
let howLinkIssue = '';
let inputLinkedIssuesArray = [];
let allJiraTickets = [];
let allUsers = [];
let assignToEpic = '';
let addXXXFile = [];
let addXXXFileAlt = [];
let addYYYFile = [];

//const tagListBoxEl = document.getElementById("tagListBox")

// loading stuff to html
let prexistingEpics = [];
const selectAssignEpic = document.getElementById("inputAssignEpic");

let prexistingIssues = [];
const selectLinkedIssues = document.getElementById("inputLinkedIssue");
const selectJiraTicketDrop = document.getElementById("inputJiraTicketID")

let prexistingReferences = [];
const listOfAvailRef = document.getElementById("inputXXXFileAlt")


// need to load epics into options
async function loadEpicOptions() {

    // only gets Epics from one board (can pass as variable but currently hardcoded)
    await fetch('/getEpics', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        console.log('Response Epics: ', response)
        return response.json();
    }).then(json => {
        console.log('Response Epics Json', json)
        json.values.forEach(x => {
            prexistingEpics.push(x.key)
        })


    });

    let htmlCodeEpics = `<option value=''>None</option>`;

    prexistingEpics.forEach(item => {
        htmlCodeEpics += `<option value="` + item + `">` + item + `</option>`
    })

    selectAssignEpic.innerHTML = htmlCodeEpics
    return;
}
// need to load issues into options
async function loadIssueOptions() {
    // only gets Issues from one board (can pass as variable but currently hardcoded)
    await fetch('/getIssues', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        console.log('Response Issues: ', response)
        return response.json();
    }).then(json => {
        console.log('Response  Issues Json', json)
        json.issues.forEach(x => {
            prexistingIssues.push(x.key)
        })
    });

    let htmlCodeIssues = '';

    prexistingIssues.forEach(item => {
        htmlCodeIssues += `<option value="` + item + `">` + item + `</option>`
    })

    selectLinkedIssues.innerHTML = htmlCodeIssues

    let htmlCodeIssues2 = `<option value=''>None</option>` + htmlCodeIssues;
    selectJiraTicketDrop.innerHTML = htmlCodeIssues2

    return;
}
// need to load references into options
async function loadRefOptions() {
    // get references from directory
    await fetch('/getListReferences', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        return response.json();
    }).then(json => {
        console.log('Response Gel List Ref Json', json)
        json.references.forEach(x => {
            prexistingReferences.push(x)
        })
    });

    let htmlCodeReferences = ''

    prexistingReferences.forEach(item => {
        htmlCodeReferences += `<option value="` + item + `">` + item + `</option>`
    })

    listOfAvailRef.innerHTML = htmlCodeReferences

    return
}

// call all load functions
loadEpicOptions()
loadIssueOptions()
loadRefOptions()

/*
* Event Listener to change between MiSeq and Nanopore sample sheets
*/
document.body.addEventListener('change', async function (e) {
    let target = e.target;
    switch (target.id) {
        case 'miseq':
            document.getElementById("nanoporeSampleSheetDiv").style.display = "none";
            document.getElementById("miSeqSampleSheetDiv").style.display = "block";
            // code to flip state to on and turn off nanopore
            break;

        case 'oxfordNanopore':
            // code to flip state on and turn off miseq
            document.getElementById("miSeqSampleSheetDiv").style.display = "none";
            document.getElementById("nanoporeSampleSheetDiv").style.display = "block";
            break;

        case 'noSampleSheet':
            document.getElementById("miSeqSampleSheetDiv").style.display = "none";
            document.getElementById("nanoporeSampleSheetDiv").style.display = "none";
            break;

    }
})

function toggleAdvancedJira() {
    if (document.getElementById("advancedJiraOptions").style.display === "block") {
        document.getElementById("advancedJiraOptions").style.display = "none"
    } else {
        document.getElementById("advancedJiraOptions").style.display = "block"
    }
}

$("#linkedIssuesDrop").on("select2:unselect", function (e) {
    $('#inputLinkedIssue').val(null).trigger('change');
    $("#inputLinkedIssue").prop("disabled", true)
})

$("#linkedIssuesDrop").on("select2:select", function (e) {
    $("#inputLinkedIssue").prop("disabled", false)
})

$("#inputJiraTicketID").on("select2:unselect", function (e) {
    $('#inputExperimentalist').val(null).trigger('change');
    $('#inputAssignEpic').val(null).trigger('change'); 
    $('#jiraCategoryDrop').val("Sequencing").trigger('change');
    $(".disableWhenJiraTicket").prop("disabled", false)
    $("#inputAssignEpic").prop("disabled", false)
})

/*
* Event Listener for inputJiraTicketID (select2 sp) to load ticket in background
*/
$('#inputJiraTicketID').on('select2:select', async function (e) {

    // disable inputs for items that no longer apply
    // ie. Assignee, Category, Project, Assign to Epic (if already has one)
    // $(".disableWhenJiraTicket").val(null).trigger('change')

    // getIssue for specific chosen key
    await fetch('/getTicket?issue_key=' + e.target.value, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        return response.json();
    }).then(json => {
        console.log("Get Issue", json)

        // update disabled fields to show proper info
        if (json.fields.project.key) {
            $('#jiraProjectDrop').val(json.fields.project.key).trigger('change')
        }
        if (json.fields.issuetype) {
            $('#jiraCategoryDrop').val(json.fields.issuetype.name).trigger('change')
        }
        $('#inputExperimentalist').val(null).trigger('change');
        if (json.fields.assignee) {
            let data = json.fields.assignee.name
            if ($('#inputExperimentalist').find("option[value='" + data + "']").length) {
                $('#inputExperimentalist').val(data).trigger('change');
            } else {
                // Create a DOM Option and pre-select by default
                var newOption = new Option(data, data, true, true);
                // Append it to the select
                $('#inputExperimentalist').append(newOption).trigger('change');
            }
        }

        $(".disableWhenJiraTicket").prop("disabled", true)
        // customfield_10100 is epic name
        if (json.fields.customfield_10100) {
            $("#inputAssignEpic").val(json.fields.customfield_10100).trigger('change');
            $("#inputAssignEpic").prop("disabled", true)
        }

    });

});


// switch to stop jira ticket creation if samplesheet fails
let sampleSheetCreationSuccess = true;
/*
* Submit handler for MiSeq
*/
async function handleMiSeqSampleSheet() {

    // get values from form
    expName = document.getElementById('experimentName').value // probably pull out of miseq
    reads1 = document.getElementById('inputReads1').value // miseq
    reads2 = document.getElementById('inputReads2').value // miseq
    module = document.getElementById('moduleDrop').value // miseq
    workflow = document.getElementById('workflowDrop').value // miseq
    libPrepKit = document.getElementById('libraryDrop').value // miseq
    indexKit = document.getElementById('indexKitDrop').value // miseq
    chemistry = document.getElementById('chemistryDrop').value // miseq

    // set set samples from table
    samples = [] // empty sample array for mistakes

    // i think all we need to do now is set samples = data from bottom
    getAllMiSeqTableVals()
    samples = miSeqTableVals

    console.log("samples:", samples)

    let errors = false;

    // Check if required fields are populated correctly
    if (!expName) {
        alert('Please add Experiment Name!', 'danger')
        errors = true
    }

    let i7andi5Pairs = []
    let allSampleIds = []
    let allSampleNames = []
    // fix simple errors and type check etc

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
            errors = true
        }
        if (!x[1]) {
            alert('Missing Sample_Name in Sample ' + (i + 1), 'danger')
            errors = true
        }
        if (!x[3]) {
            alert('Missing I7 Index in Sample ' + (i + 1), 'danger')
            errors = true
        }
        if (!x[5]) {
            alert('Missing I5 Index in Sample ' + (i + 1), 'danger')
            errors = true
        }


        // this is where we need to do checking on the sample information
        // need to double check the index on these
        // (these should be good bc using dropdown but also has self input so keep... )
        if (x[3].match(/[^ATCGN]/) || x[5].match(/[^ATCGN]/)) {
            alert('Invalid characters present in I5 or I7 Index for Sample ' + (i + 1), 'danger')
            errors = true;
        }
        if (x[3].length != 8 || x[5].length != 8) {
            alert('I5 or I7 Index length is incorrect length for Sample ' + (i + 1), 'danger')
            errors = true;
        }
        // add I7 and I5 pair to list
        i7andi5Pairs.push({ 'i7': x[3], 'i5': x[5] })

        // add all sample Ids/Names to list
        allSampleIds.push(x[0])
        allSampleNames.push(x[1])

        // // check for references in sample sheet being none/empty
        // if (x[8] === 'None' || x[8] === '') {
        //     // add alert and stop here if desired
        //     // errors = true
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
                errors = true
            }
        })
    })

    // check that all sample_Ids and names are unique
    if (allSampleIds.length !== _.uniq(allSampleIds).length) {
        alert('Please make sure all sample Ids are unique', 'danger')
    }
    if (allSampleNames.length !== _.uniq(allSampleNames).length) {
        alert('Please make sure all sample Names are unique', 'danger')
    }

    // check only numbers in reads
    if (isNaN(reads1) || isNaN(reads2)) {
        alert('Make sure Reads are only numbers', 'danger')
        errors = true
    }

    if (errors) {
        sampleSheetCreationSuccess = false
        return;
    }

    expName = expName.split('-').join('_') // replace - with _

    // make samplesheet
    await makeMiseqSampleSheet()

    // make dynamic sample sheet
    // await makeDynamicSampleSheet()

    // attach samplesheet to folder
    await fetch("/downloadSampleSheet", {
        method: "POST",
        body: sampleSheetToPass,
    }).catch((error) => ("Something went wrong!", error));

}

/*
* General Submit Form Handler
*/
async function submitForm(e) {
    // e.preventDefault()

    console.log("submit called")

    // get values from form
    jiraTicketID = document.getElementById('inputJiraTicketID').value
    sequencingInfo = document.getElementById('inputSequencingInfo').value // extra - comments
    experimentalist = document.getElementById('inputExperimentalist').value
    stakeholders = [...document.getElementById('inputStakeholder').selectedOptions].map(x => x.value)
    jiraCategory = document.getElementById('jiraCategoryDrop').value
    jiraProject = document.getElementById('jiraProjectDrop').value
    assignToEpic = document.getElementById('inputAssignEpic').value
    howLinkIssue = document.getElementById('linkedIssuesDrop').value
    inputLinkedIssuesArray = [...document.getElementById("inputLinkedIssue").selectedOptions].map(x => x.value) // should check if empty?
    inputTagsArray = [...document.getElementById("inputTags").selectedOptions].map(x => x.value) // also may need to check if empty
    addXXXFile = document.getElementById('inputXXXFile').files // references
    addXXXFileAlt = [...document.getElementById('inputXXXFileAlt').selectedOptions].map(x => x.value)
    addYYYFile = document.getElementById('inputYYYFile').files
    console.log("REFFF File", addXXXFile)
    console.log('len addXXXFile', addXXXFileAlt)
    console.log('Experimentalist', experimentalist)
    // console.log(document.getElementById('inputSamples').value.split(/\r?\n/))

    // check to see all required fields are populated correctly
    // if (!sequencingInfo) {
    //     alert('Please add Sequencing Info!', 'danger')
    //     return;
    // }
    if (!experimentalist && !jiraTicketID) {
        alert('Please add a Assignee!', 'danger')
        return; // if get more things that we want to call 
        // errors on then maybe pull out and throw all alerts before returning
        // like how I did with sample sheet creation
    }
    // manually correct categories for specific projects HARDCODED
    if (jiraProject === 'TES') {
        jiraCategory = 'Task'
    }
    if (jiraProject === 'NT' && jiraCategory === 'Sequencing') {
        jiraCategory = 'Story'
    }
    // check if any references have been attached in either location
    if (addXXXFile.length === 0 && addXXXFileAlt.length === 0) {

        // can replace with bootbox/bootstrap in future if desired
        if (!confirm("You are submitting without attaching a reference, this is not recommended")) {
            return;
        }

    }
    // check formating of fields
    sequencingInfo = sequencingInfo.split('-').join('_')

    // branch based on MiSeq / Nanopore
    if (document.getElementById("miseq").checked) {
        await handleMiSeqSampleSheet() // await needed for dynamic samplesheet creation?
    }
    if (document.getElementById("oxfordNanopore").checked) {
        await handleNanoporeSampleSheet()
    }

    // checks if sample sheet creation has failed and cancels if failed
    if (!sampleSheetCreationSuccess) {
        return;
    }

    // add (all new) added files to csvFileToPass 
    Array.from(addXXXFile).forEach(x => {
        csvFileToPass.append('file', x)
        refFilesToPass.append('file', x)
    })

    Array.from(addYYYFile).forEach(x => {
        csvFileToPass.append('file', x)
    })

    //addXXXFileAlt = ['hello.txt', 'hello2.txt'] // for testing purposes
    // add names of any already uploaded ref to csvFileToPass
    // csvFileToPass.append('refToGrab', JSON.stringify(addXXXFileAlt))
    for (var i = 0; i < addXXXFileAlt.length; i++) {
        csvFileToPass.append('arr[]', addXXXFileAlt[i]);
    }

    // attach document and update issue if Jira ticket Id exists
    // otherwise create a JiraTicket for the run
    if (jiraTicketID) {

        csvFileToPass.append('jiraId', jiraTicketID)

        // attach document to jira issue
        await fetch("/addAttachment2Issue", {
            method: "POST",
            body: csvFileToPass,
        }).catch((error) => ("Something went wrong!", error));

        // download References to cluster
        // going to need to wrap in something to see if Ref needs to be uploaded
        await fetch("/downloadReference", {
            method: "POST",
            body: refFilesToPass,
        }).catch((error) => ("Something went wrong!", error));

        const json = {
            id: jiraTicketID,
            // project: jiraProject, // shouldnt need because already in project
            // category: jiraCategory, // dont want to change category
            tags: inputTagsArray, // done
            info: sequencingInfo, // done -- added as commment
            // user: experimentalist, // assignee (should already be set )
            watchers: stakeholders, // done -- untested
            assignEpic: assignToEpic, // I remove option above but may need to make sure not setting to blank
            howLink: howLinkIssue, // yah gonna need to check this stuff 
            linkIssue: inputLinkedIssuesArray

        }
        const body = JSON.stringify(json);

        // update an issue
        await fetch('/updateIssue', {
            method: 'PUT',
            body,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            console.log('Response Update Issue: ', response)
            return response.json();
        }).then(json => {
            console.log('Response Update Issue Json: ', json)
        }).catch(error => {
            console.log('Error:', error)
        })

    } else { // creates Jira Ticket from scratch

        const json = {
            info: sequencingInfo,
            project: jiraProject,
            category: jiraCategory,
            tags: inputTagsArray, // array
            user: experimentalist, // assignee
            watchers: stakeholders, // array
            assignEpic: assignToEpic,
            howLink: howLinkIssue,
            linkIssue: inputLinkedIssuesArray // array
        }
        const body = JSON.stringify(json);

        let returnedIssueKey = '';

        // make an issue if one is not provided
        await fetch('/makeIssue', {
            method: 'POST',
            body,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            console.log('Response: ', response)
            return response.json();
        }).then(json => {
            returnedIssueKey = json.key
            console.log(json)
        })

        // add attachment to this issue
        csvFileToPass.append('jiraId', returnedIssueKey)

        // attach document to jira issue
        await fetch("/addAttachment2Issue", {
            method: "POST",
            body: csvFileToPass,
        }).catch((error) => ("Something went wrong!", error));

        await fetch("/downloadReference", {
            method: "POST",
            body: refFilesToPass,
        }).catch((error) => ("Something went wrong!", error));

    }

    // everything to blank again
    // location.reload()
}


let sampleSheetToPass = new FormData()

function makeMiseqSampleSheet() {
    let csvSampleSheetMiSeq = '[Header]\n';
    csvSampleSheetMiSeq += "Local Run Manager Analysis Id," + lrmaId + '\n'
    csvSampleSheetMiSeq += "Experiment Name," + expName + '\n'
    csvSampleSheetMiSeq += "Date," + date.toISOString().split('T')[0] + '\n'
    csvSampleSheetMiSeq += "Module," + module + '\n'
    csvSampleSheetMiSeq += "Workflow," + workflow + '\n'
    csvSampleSheetMiSeq += "Library Prep Kit," + libPrepKit + '\n'
    csvSampleSheetMiSeq += "Index Kit," + indexKit + '\n'
    csvSampleSheetMiSeq += "Chemistry," + chemistry + '\n'

    csvSampleSheetMiSeq += "\n[Reads]\n"
    csvSampleSheetMiSeq += reads1 + '\n'
    csvSampleSheetMiSeq += reads2 + '\n'

    csvSampleSheetMiSeq += "\n[Settings]\n"

    csvSampleSheetMiSeq += "\n[Data]\n"

    // add header names
    csvSampleSheetMiSeq += miSeqTableHeaders.join(',') + "\n"

    // add samples
    samples.forEach((x, index) => {
        csvSampleSheetMiSeq += x.join(',') + "\n"
    })
    let fileName = expName + '_' + date.toISOString().split('T')[0].split('-').join('_') + '_SampleSheet.csv'
    let csvSampleSheetMiSeqData = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });


    sampleSheetToPass.append('file', new File([csvSampleSheetMiSeqData], fileName))

    // // old way of downloading sample sheet directly to user
    // let csvUrl = URL.createObjectURL(csvSampleSheetMiSeqData);

    // let hiddenElement = document.createElement('a');
    // hiddenElement.href = csvUrl;
    // hiddenElement.target = '_blank';
    // hiddenElement.download = 'PortalCreatedSampleSheet.csv'; // edit this to properly name the sample sheet
    // hiddenElement.click();

    return;
}

let csvFileToPass = new FormData()
let refFilesToPass = new FormData()

function makeDynamicSampleSheet() {
    let csv = 'expName,date,module,seqInfo,experimentalist,watchers\n';
    csv += expName + ',' + date.toISOString().split('T')[0] + ',' + module + ',' + sequencingInfo + ',' + experimentalist + ',' + stakeholders

    // possibly add each sample on end (would need to dynamically create headers or put in brackets idk)
    // samples.forEach((x, index) => {

    //     csv += x.join(',')
    // })

    let fileName = expName + 'Info.csv'
    let csvDataDynamic = new Blob([csv], { type: 'text/csv' });

    csvFileToPass.append('file', new File([csvDataDynamic], fileName))

    return;
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
* New MiSEQ Table
*
*/

/*
* Fxn makes table row
*/
function create_tr(table_id) {

    $('.select2ClassAddMiSeq').select2('destroy')

    let table_body = document.getElementById(table_id),
        first_tr = table_body.lastElementChild
    tr_clone = first_tr.cloneNode(true);

    table_body.append(tr_clone);

    clean_last_tr(table_body.lastElementChild);

    $('.select2ClassAddMiSeq').select2({
        placeholder: 'None',
        tags: true
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
function remove_tr(This) {
    if (This.closest('tbody').childElementCount == 1) {
        alert("You don't have permission to delete this", "warning");
    } else {
        This.closest('tr').remove();

        // and renumber everything
        let rowNum = 1
        $("#miseq_table_body tr").each(function () {
            $(this).children(":first").text(rowNum)
            rowNum++
        })
    }
}


let miSeqTableVals = []
let miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project']

/*
* Pulls all of sample information frome the table... 
* only pulls information from extra columns if title for those columns is filled in
*/
function getAllMiSeqTableVals() {

    // reset just in case
    miSeqTableVals = []
    miSeqTableHeaders = ['Sample_ID', 'Sample_Name', 'Description', 'I7_Index_ID', 'index', 'I5_Index_ID', 'index2', 'Sample_Project']

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

    // get values
    $("#miseq_table_body tr").each(function () {

        let rowVals = []

        rowVals.push($(this).find(".sampId").val())
        rowVals.push($(this).find(".sampName").val())
        rowVals.push($(this).find(".sampDes").val())
        // rowVals.push($(this).find(".sampI7 option:selected").text()) // gets text value
        rowVals.push($(this).find(".sampI7").val())
        // rowVals.push($(this).find(".sampInd").val())
        rowVals.push($(this).find(".sampI7").val()) // push I7 again for index
        rowVals.push($(this).find(".sampI5").val())
        // rowVals.push($(this).find(".sampInd2").val())
        rowVals.push($(this).find(".sampI5").val()) // push I5 again for index2
        rowVals.push($(this).find(".sampProj").val())
        // rowVals.push($(this).find(".sampRef").val())
        rowVals.push($(this).find(".sampRef option:selected").text())

        if (hasExtra1) {
            rowVals.push($(this).find(".sampEx1").val())
        }
        if (hasExtra2) {
            rowVals.push($(this).find(".sampEx2").val())
        }
        if (hasExtra3) {
            rowVals.push($(this).find(".sampEx3").val())
        }

        miSeqTableVals.push(rowVals)

    })

}









/*
* TESTING BUTTON
*
*/

async function testButton() {


    const json = {
        id: "TES-46",
        tags: ["Tag1", "Tag2", "Tag3"], // working
        info: "New Description2", // adds as comment
        watchers: []
        // watchers: stakeholders, // should work
        // assignEpic: assignToEpic, // I remove option above but may need to make sure not setting to blank
        // howLink: howLinkIssue, // yah gonna need to check this stuff 
        // linkIssue: inputLinkedIssuesArray

    }
    const body = JSON.stringify(json);

    // update an issue
    await fetch('/updateIssue', {
        method: 'PUT',
        body,
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        console.log('Response: ', response)
        return response.json();
    }).then(json => {
        console.log('Response Json: ', json)
    }).catch(error => {
        console.log('Error:', error)
    })

}


