// const { csv } = require("d3");

console.log('d3', d3.version)

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
const selectLinkedIssues = document.getElementById("issuesList2");
const selectJiraTicketDrop = document.getElementById("listIssues")

let prexistingReferences = [];
const listOfAvailRef = document.getElementById("listAvailReferences")


// need to load epics and issues into options
async function loadOptions() {

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
        console.log('Response Json', json)
        json.values.forEach(x => {
            prexistingEpics.push(x.key)
        })
    });

    let htmlCodeEpics = `<option selected="selected" value="">None</option>`;

    prexistingEpics.forEach(item => {
        htmlCodeEpics += `<option value="` + item + `">` + item + `</option>`
    })

    selectAssignEpic.innerHTML = htmlCodeEpics

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
        console.log('Response Json', json)
        json.issues.forEach(x => {
            prexistingIssues.push(x.key)
        })
    });

    let htmlCodeIssues = '';

    prexistingIssues.forEach(item => {
        htmlCodeIssues += `<option value="` + item + `"></option>`
    })

    selectLinkedIssues.innerHTML = htmlCodeIssues

    selectJiraTicketDrop.innerHTML = htmlCodeIssues

    // get references from directory
    await fetch('/getListReferences', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        return response.json();
    }).then(json => {
        console.log('Response Ref Json', json)
        json.references.forEach(x => {
            prexistingReferences.push(x)
        })
    });

    let htmlCodeReferences = `<option value=''></option>`

    prexistingReferences.forEach(item => {
        htmlCodeReferences += `<option value="` + item + `"></option>`
    })

    listOfAvailRef.innerHTML = htmlCodeReferences

    return;
}

loadOptions()

// function skipSampleSheet() {
//     document.getElementById("sequencingSelectionDiv").style.display = "none";
// }

// function goToMiSeq() {
//     document.getElementById("sequencingSelectionDiv").style.display = "none";
//     document.getElementById("sampleSheetDiv").style.display = "block";
//     document.getElementById("miSeqSampleSheetDiv").style.display = "block";
// }

// function goToNanopore() {
//     document.getElementById("sequencingSelectionDiv").style.display = "none";
//     document.getElementById("sampleSheetDiv").style.display = "block";
//     document.getElementById("nanoporeSampleSheetDiv").style.display = "block";
// }

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

        case 'inputJiraTicketID':


            if (e.target.value) {
                document.getElementById('projectRow').style.display = "none";

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

                    // populate preexisting fields with information from Issue
                    // let issueCom = json.fields.
                    // let 

                });


            } else {
                document.getElementById('projectRow').style.display = "block";
            }

            break;

    }
})

// async function getAllJiraTicketIDs() {

//     await fetch('/getTicketIds', {
//         method: 'GET',
//         headers: {
//             "Content-Type": "application/json"
//         }
//     }).then(response => {
//         console.log('Response: ', response)
//         return response.json();
//     }).then(json => {});

//     return;
// }

// getAllJiraTicketIDs();
// async function getUsers() {
//     await fetch("/getUsers", {
//         method: "GET"
//     }).then(response => {
//         return response.json()
//     }).then(json => {
//         console.log(json)
//         //allUsers = json
//         return json
//     }).catch((error) => ("Something went wrong!", error));
// }
// getUsers()

/*
* Old tag system
*/
// function addTag() {
//     const tag = document.getElementById("inputTag").value;
//     inputTagsArray.push(tag)

//     displayTodo();

// }

// function deleteTodo(ind) {

//     inputTagsArray.splice(ind, 1);
//     displayTodo();

//    }

// function displayTodo() {
//     let htmlCode = '';

//     inputTagsArray.forEach((item, ind) => {
//         htmlCode += `<div style="display:flex; padding:5px; border-radius:25%; background-color:#696969"> <p style="padding-right: 5px;">` + item + `</p> <button onclick='deleteTodo(` + ind +`)' class='btn btn-danger'>Delete</button></div>`
//     })

//     tagListBoxEl.innerHTML = htmlCode

//     // const htmlElement = document.createElement('div')
//     // htmlElement.appendChild(document.createElement('p'))

// }

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
    let titleRow = [];
    samples = [] // empty sample array for mistakes
    Object.entries(mySpreadSheet.datas[0].rows._).forEach((x, indexX) => {

        if (indexX == 0) {
            Object.entries(x[1].cells).forEach(y => {
                titleRow.push(y[1].text)
            })
            samples.push(titleRow)
        } else {
            let arrayRow = Array(titleRow.length).fill("")
            Object.entries(x[1].cells).forEach(y => {
                arrayRow[y[0]] = y[1].text.split('-').join('_') // replaces - with _ 
            })
            samples.push(arrayRow)
        }

    })

    console.log("samples:", samples)

    // Check if required fields are populated correctly
    if (samples.length <= 1) {
        alert('Please add Samples!', 'danger')
        return;
    }
    if (!expName) {
        alert('Please add Experiment Name!', 'danger')
        return;
    }

    let errors = false;
    samples.forEach((x, i) => {

        // if we've already found errors no need to keep checking each row
        if (errors) { return; }

        // check header info and sample control checks for header.
        // want to check all necesary columns are there and get their index potentially? 
        // want to see what columns have been added?
        if (i == 0) {
            return;
        }

        if (x[3].match(/[^ATCGN]/)) {
            alert('Invalid characters present in I7_Index_ID', 'danger')
            errors = true;
            return;
        } else if (x[4].match(/[^ATCGN]/)) {
            alert('Invalid characters present in index', 'danger')
            errors = true;
            return;
        } else if (x[5].match(/[^ATCGN]/)) {
            alert('Invalid characters present in I5_Index_ID', 'danger')
            errors = true;
            return;
        } else if (x[6].match(/[^ATCGN]/)) {
            alert('Invalid characters present in index2', 'danger')
            errors = true;
            return;
        }
    })
    if (errors) { return; }

    if (isNaN(reads1)) {
        alert('Make sure Reads are only numbers', 'danger')
        return;
    }
    if (isNaN(reads2)) {
        alert('Make sure Reads are only numbers', 'danger')
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
    stakeholders = document.getElementById('inputStakeholder').getValues()
    jiraCategory = document.getElementById('jiraCategoryDrop').value
    jiraProject = document.getElementById('jiraProjectDrop').value
    assignToEpic = document.getElementById('inputAssignEpic').value
    howLinkIssue = document.getElementById('linkedIssuesDrop').value
    inputLinkedIssuesArray = document.getElementById("inputLinkedIssue").getValues() // should check if empty?
    inputTagsArray = document.getElementById("inputTags").getValues() // also may need to check if empty
    addXXXFile = document.getElementById('inputXXXFile').files // references
    addXXXFileAlt = document.getElementById('inputXXXFileAlt').getValues()
    addYYYFile = document.getElementById('inputYYYFile').files
    console.log("REFFF File", addXXXFile)
    console.log('Experimentalist', experimentalist)
    // console.log(document.getElementById('inputSamples').value.split(/\r?\n/))

    // branch based on MiSeq / Nanopore
    if (document.getElementById("miseq").checked) {
        await handleMiSeqSampleSheet() // await needed for dynamic samplesheet creation?
    }
    if (document.getElementById("oxfordNanopore").checked) {
        await handleNanoporeSampleSheet()
    }


    // check to see all required fields are populated correctly
    // if (!sequencingInfo) {
    //     alert('Please add Sequencing Info!', 'danger')
    //     return;
    // }
    if (!experimentalist) {
        alert('Please add a Assignee!', 'danger')
        return;
    }
    // manually correct categories for specific projects
    if (jiraProject === 'TES') {
        jiraCategory = 'Task'
    }
    if (jiraProject === 'NT' && jiraCategory === 'Sequencing') {
        jiraCategory = 'Story'
    }

    // check formating of fields
    sequencingInfo = sequencingInfo.split('-').join('_')


    // check if any references have been attached in either location
    if (!addXXXFile && !addXXXFileAlt) {
        // Throw warning that no reference is attached... need to click out of it to continue
    }

    // add (all new) added files to csvFileToPass 
    Array.from(addXXXFile).forEach(x => {
        csvFileToPass.append('file', x) // might need to tweak to account for multiple files
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
            category: jiraCategory,
            tags: inputTagsArray, // might need 2 categories for new/old -- nvm
            info: sequencingInfo,
            user: experimentalist, // assignee (should already be set (see if more added))
            watchers: stakeholders, // might need to detect changes
            assignEpic: assignToEpic, // might need to detect changes
            howLink: howLinkIssue,
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
            console.log('Response: ', response)
            return response.json();
        }).then(json => {
            console.log('Response Json: ', json)
        }).catch(error => {
            console.log('Error:', error)
        })

    } else { // creates Jira Ticket from scratch

        const json = {
            info: sequencingInfo,
            project: jiraProject,
            category: jiraCategory,
            tags: inputTagsArray,
            user: experimentalist, // assignee
            watchers: stakeholders,
            assignEpic: assignToEpic,
            howLink: howLinkIssue,
            linkIssue: inputLinkedIssuesArray
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


    // await fetch('/getTicketIds', {
    //   method: 'GET',
    //   headers: {
    //     "Content-Type": "application/json"
    //   }
    // }).then(response => {
    //   console.log('Response', response)
    //   return response.json();
    // }).then(json => {console.log('json', json)})

    // everything to blank again
    //location.reload()
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


    samples.forEach((x, index) => {

        csvSampleSheetMiSeq += x.join(',') + "\n"
        // if (index == 0) {
        //     csv += x.join(',') + "\n";
        // }
        //csv += date.toLocaleDateString('sv').replaceAll('-', ''); + '_' + x.join('_') +"\n";
    })
    let fileName = expName + 'SampleSheet.csv'
    let csvSampleSheetMiSeqData = new Blob([csvSampleSheetMiSeq], { type: 'text/csv' });


    sampleSheetToPass.append('file', new File([csvSampleSheetMiSeqData], fileName))

    // old way of downloading sample sheet directly to user
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


//////////////////////////////Spreadsheet stuff////////////////

const myData = [{
    name: 'Samples',
    freeze: 'A2',
    styles: [
        {
            bgcolor: '#f4f5f8',
            color: '#900b09',
            border: {
                top: ['thin', '#0366d6'],
                bottom: ['thin', '#0366d6'],
                right: ['thin', '#0366d6'],
                left: ['thin', '#0366d6'],
            },
        },
    ],
    rows: {
        0: {
            cells: {
                0: { text: 'Sample_ID', style: 0 },
                1: { text: 'Sample_Name', style: 0 },
                2: { text: 'Description', style: 0 },
                3: { text: 'I7_Index_ID', style: 0 },
                4: { text: 'index', style: 0 },
                5: { text: 'I5_Index_ID', style: 0 },
                6: { text: 'index2', style: 0 },
                7: { text: 'Sample_Project', style: 0 },
                8: { text: 'Exp_Con', style: 0 },
                9: { text: 'Call type', style: 0 }
            },

        },
        1: {
            cells: {
                0: { text: 'Sample1' },
                1: { text: 'Sample1' },
                3: { text: 'CGATCATG' },
                4: { text: 'CGATCATG' },
                5: { text: 'AAGTAGAG' },
                6: { text: 'AAGTAGAG' },
                8: { text: 'WT' }
            }
        }
    },
}
]

const options = {
    mode: 'edit', // edit | read
    showToolbar: true,
    showGrid: true,
    showContextmenu: true,
    view: {
        height: () => document.documentElement.clientHeight * .70,
        width: () => document.documentElement.clientWidth * .75,
    },
    row: {
        len: 50,
        height: 25,
    },
    col: {
        len: 12,
        width: 100,
        indexWidth: 60,
        minWidth: 60,
    },
    style: {
        bgcolor: '#ffffff',
        align: 'left',
        valign: 'middle',
        textwrap: false,
        strike: false,
        underline: false,
        color: '#0a0a0a',
        font: {
            name: 'Helvetica',
            size: 10,
            bold: false,
            italic: false,
        },
    },
}

let mySpreadSheet = x_spreadsheet('#miSeqTable', options)
    .loadData(myData)

// mySpreadSheet.cellStyle(0,0,)
// .change(data => {
//     console.log(data)
// });

// // data validation
// s.validate()

console.log(mySpreadSheet.datas[0].rows._);



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

