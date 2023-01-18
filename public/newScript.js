import * as miseqMod from '/miseqScript.js'
import * as nanoMod from '/nanoScript.js'


$(document).ready(function () {

    // initialize pop overs
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
    // $('.linkedIssueInfo').popover({
    //     container: 'body',
    //     content: "Does this ticket have any relationship with other tickets? Ex: Is it blocked by another?"
    // })
    // $('.referenceInfo').popover({
    //     container: 'body',
    //     content: "Be a pal and upload your references. Select from file system or from previously uploaded list."
    // })
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


    // add event listeners to buttons
    document.getElementById('toggleAdvancedJiraText').addEventListener('click', toggleAdvancedJira)
    document.getElementById('submitFormBtn').addEventListener('click', submitForm)

});

console.log('lo', _.VERSION)


let jiraTicketID = '';
let expName = '';
let descriptionInfo = '';
let experimentalist = ''; // Assignee
let stakeholders = []; // Watchers
let date = new Date();
let jiraCategory = ''
let jiraProject = ''

let inputTagsArray = [];
// let howLinkIssue = '';
// let inputLinkedIssuesArray = [];
let allJiraTickets = [];
let allUsers = [];
let assignToEpic = '';
let addXXXFile = [];
let addXXXFileAlt = [];
let addYYYFile = [];
let csvFileToPass = new FormData()
let refFilesToPass = new FormData()

// loading stuff to html
let prexistingEpics = [];
const selectAssignEpic = document.getElementById("inputAssignEpic");

let prexistingIssues = [];
// const selectLinkedIssues = document.getElementById("inputLinkedIssue");
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

    // selectLinkedIssues.innerHTML = htmlCodeIssues

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

// $("#linkedIssuesDrop").on("select2:unselect", function (e) {
//     $('#inputLinkedIssue').val(null).trigger('change');
//     $("#inputLinkedIssue").prop("disabled", true)
// })

// $("#linkedIssuesDrop").on("select2:select", function (e) {
//     $("#inputLinkedIssue").prop("disabled", false)
// })

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




/*
* General Submit Form Handler
*/
async function submitForm(e) {
    // e.preventDefault()
    console.log("submit called")

    // get values from form
    jiraTicketID = document.getElementById('inputJiraTicketID').value
    jiraTicketID = '' //safety device before completely deactivating updating tickets
    descriptionInfo = document.getElementById('inputDescriptionInfo').value // extra - comments
    experimentalist = document.getElementById('inputExperimentalist').value
    stakeholders = [...document.getElementById('inputStakeholder').selectedOptions].map(x => x.value)
    jiraCategory = document.getElementById('jiraCategoryDrop').value
    jiraProject = document.getElementById('jiraProjectDrop').value
    assignToEpic = document.getElementById('inputAssignEpic').value
    // howLinkIssue = document.getElementById('linkedIssuesDrop').value
    // inputLinkedIssuesArray = [...document.getElementById("inputLinkedIssue").selectedOptions].map(x => x.value) // should check if empty?
    inputTagsArray = [...document.getElementById("inputTags").selectedOptions].map(x => x.value) // also may need to check if empty
    addXXXFile = document.getElementById('inputXXXFile').files // references
    addXXXFileAlt = [...document.getElementById('inputXXXFileAlt').selectedOptions].map(x => x.value)
    addYYYFile = document.getElementById('inputYYYFile').files
    console.log("Ref File", addXXXFile)
    console.log('Alt Ref File', addXXXFileAlt)

    // check to see all required fields are populated correctly can combine if get a lot
    if (!experimentalist && !jiraTicketID) {
        alert('Please add a Assignee!', 'danger')
        return;
    }
    // if (!descriptionInfo) {
    //     alert('Please add Sequencing Info!', 'danger')
    //     return;
    // }

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
    descriptionInfo = descriptionInfo.split('-').join('_')

    // branch based on MiSeq / Nanopore
    if (document.getElementById("miseq").checked) {
        // miseqscript.js
        await miseqMod.handleMiSeqSampleSheetPromise()

        // set expName
        expName = miseqMod.miseqExpName

        // add files to csvFileToPass
        csvFileToPass.append('file', miseqMod.miSeqDynamicFile)

        // check for creation success
        if (!miseqMod.miseqSampleSheetCreationSuccess) {
            return
        }
    }

    if (document.getElementById("oxfordNanopore").checked) {
        // nanoscript.js
        await nanoMod.handleNanoporeSampleSheetPromise()

        // set expName
        expName = nanoMod.nanoExpName

        // add files to csvFileToPass
        csvFileToPass.append('file', nanoMod.nanoDynamicFile)

        // check for creation success
        if (!nanoMod.nanoSampleSheetCreationSuccess) {
            return
        }
    }


    // add (all new) added files to csvFileToPass 
    Array.from(addXXXFile).forEach(x => {
        csvFileToPass.append('file', x)
        refFilesToPass.append('file', x)
    })

    Array.from(addYYYFile).forEach(x => {
        csvFileToPass.append('file', x)
    })

    // add names of any already uploaded ref to csvFileToPass
    // csvFileToPass.append('refToGrab', JSON.stringify(addXXXFileAlt))
    for (var i = 0; i < addXXXFileAlt.length; i++) {
        csvFileToPass.append('arr[]', addXXXFileAlt[i]);
    }

    // attach document and update issue if Jira ticket Id exists
    // otherwise create a JiraTicket for the run
    if (jiraTicketID) {

        csvFileToPass.append('jiraId', jiraTicketID)
        refFilesToPass.append('jiraId', jiraTicketID)

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
            tags: inputTagsArray,
            info: descriptionInfo,
            // user: experimentalist, // assignee (should already be set )
            watchers: stakeholders,
            assignEpic: assignToEpic, // I remove option above but may need to make sure not setting to blank
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
            console.log('Response Update Issue: ', response)
            return response.json();
        }).then(json => {
            console.log('Response Update Issue Json: ', json)
        }).catch(error => {
            console.log('Error:', error)
        })

    } else { // creates Jira Ticket from scratch

        const json = {
            info: descriptionInfo,
            summary: expName,
            project: jiraProject,
            category: jiraCategory,
            tags: inputTagsArray, // array
            user: experimentalist, // assignee
            watchers: stakeholders, // array
            assignEpic: assignToEpic,
            // howLink: howLinkIssue,
            // linkIssue: inputLinkedIssuesArray // array
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

        alert('Jira Ticket ' + returnedIssueKey + ' has successfully been created.', 'success')

        // add attachment to this issue
        csvFileToPass.append('jiraId', returnedIssueKey)
        refFilesToPass.append('jiraId', returnedIssueKey)


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

    // refresh everything to blank again
    // location.reload()
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
*   UNUSED here BUT HELPFUL FXNS
*
*/

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


const delay = ms => new Promise(res => setTimeout(res, ms));


