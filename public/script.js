//const { response } = require("express");

let typeOfSeq = 'MISEQ';
let jiraTicketID = '';
let samples = [];
let sequencingInfo = '';
let experimentalist = ''; // Assignee
let stakeholders = ''; // Watchers
let reads1 = 151;
let reads2 = 151;
let lrmaId = 10000
let expName = ""
let date = new Date();
let module = "";
let workflow = "";
let libPrepKit = "";
let indexKit = "";
let chemistry = "";
let inputTagsArray = [];
let allJiraTickets = [];
let allUsers = [];
let assignToEpic = '';

const tagListBoxEl = document.getElementById("tagListBox")


console.log('d3', d3.version)

// d3.csv('nanoporeFolders.csv', (data) => {
//     console.log(data)
// });

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
function addTag() {
    const tag = document.getElementById("inputTag").value;
    inputTagsArray.push(tag)

    displayTodo();

}

function deleteTodo(ind) {
    
    inputTagsArray.splice(ind, 1);
    displayTodo();

   }

function displayTodo() {
    let htmlCode = '';

    inputTagsArray.forEach((item, ind) => {
        htmlCode += `<div style="display:flex; padding:5px; border-radius:25%; background-color:#696969"> <p style="padding-right: 5px;">` + item + `</p> <button onclick='deleteTodo(` + ind +`)' class='btn btn-danger'>Delete</button></div>`
    })

    tagListBoxEl.innerHTML = htmlCode

    // const htmlElement = document.createElement('div')
    // htmlElement.appendChild(document.createElement('p'))

}

async function submitForm(e) {
    // e.preventDefault()

    // get all users
    

    console.log("submit called")
    // get values from form
    expName = document.getElementById('experimentName').value
    jiraTicketID = document.getElementById('inputJiraTicketID').value
    sequencingInfo = document.getElementById('inputSequencingInfo').value
    experimentalist = document.getElementById('inputExperimentalist').value
    stakeholders = document.getElementById('inputStakeholder').value
    reads1 = document.getElementById('inputReads1').value
    reads2 = document.getElementById('inputReads2').value
    module = document.getElementById('moduleDrop').value
    workflow = document.getElementById('workflowDrop').value
    libPrepKit = document.getElementById('libraryDrop').value
    indexKit = document.getElementById('indexKitDrop').value
    chemistry = document.getElementById('chemistryDrop').value
    jiraCategory = document.getElementById('jiraCategoryDrop').value
    assignToEpic = document.getElementById('inputAssignEpic')
    // console.log(document.getElementById('inputSamples').value.split(/\r?\n/))

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

    // check to see all required fields are populated correctly

    if (!expName) {
        alert('Please add Experiment Name!', 'danger')
        return;
    }
    if (!sequencingInfo) {
        alert('Please add Sequencing Info!', 'danger')
        return;
    }
    if (samples.length <= 1) { 
        alert('Please add Samples!', 'danger') 
        return;
    }
    if (!experimentalist) {
        alert('Please add Experimentalist!', 'danger')
        return;
    }

    // check formating of fields

    let errors = false;
    samples.forEach((x, i) => {

        // if we've already found errors no need to keep checking each row
        if (errors){return;}

        // check header info and sample control checks for header.
        // want to check all necesary columns are there and get their index potentially? 
        // want to see what columns have been added?
        if (i==0) {
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
    if (errors) {return;}
    
    
    if (isNaN(reads1)){
        alert('Make sure Reads are only numbers', 'danger')
        return;
    }
    if (isNaN(reads2)){
        alert('Make sure Reads are only numbers', 'danger')
        return;
    }
    expName = expName.split('-').join('_') // replace - with _
    sequencingInfo = sequencingInfo.split('-').join('_')

    // make samplesheet
    // if (document.getElementById('miseq').checked) {
    makeMiseqSampleSheet()
    // }

    // make dynamic sample sheet
    makeDynamicSampleSheet()

    // attach document and update issue if Jira ticket Id exists
    // otherwise create a JiraTicket for the run
    if (jiraTicketID) {

        csvFileToPass.append('jiraId', jiraTicketID)

        // attach document to jira issue
        await fetch("/addAttachment2", {
            method: "POST",
            body: csvFileToPass,
        }).catch((error) => ("Something went wrong!", error));

        const json = { 
            id: jiraTicketID,
            category: jiraCategory,
            tags: inputTagsArray,
            info: sequencingInfo,
            user: experimentalist, // assignee
            watchers: stakeholders, 
            assign: assignToEpic
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

    } else {

        const json = { 
            info: sequencingInfo,
            category: jiraCategory,
            tags: inputTagsArray,
            user: experimentalist, // assignee
            watchers: stakeholders,
            assign: assignToEpic
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
        await fetch("/addAttachment2", {
            method: "POST",
            body: csvFileToPass,
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


function makeMiseqSampleSheet() {
    let csv = '[Header]\n';
    csv += "Local Run Manager Analysis Id," + lrmaId + '\n'
    csv += "Experiment Name," + expName + '\n'
    csv += "Date," + date.toISOString().split('T')[0] + '\n'
    csv += "Module," + module + '\n'
    csv += "Workflow," + workflow + '\n'
    csv += "Library Prep Kit," + libPrepKit + '\n'
    csv += "Index Kit," + indexKit + '\n'
    csv += "Chemistry," + chemistry + '\n'

    csv += "\n[Reads]\n"
    csv += reads1 + '\n'
    csv += reads2 + '\n'

    csv += "\n[Settings]\n"

    csv += "\n[Data]\n"


    samples.forEach((x, index) => {

        csv += x.join(',') + "\n"
        // if (index == 0) {
        //     csv += x.join(',') + "\n";
        // }
        //csv += date.toLocaleDateString('sv').replaceAll('-', ''); + '_' + x.join('_') +"\n";
    })
    let csvData = new Blob([csv], { type: 'text/csv' });

    let csvUrl = URL.createObjectURL(csvData);
 
    let hiddenElement = document.createElement('a');
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = 'PortalCreatedSampleSheet.csv'; // edit this to properly name the sample sheet
    hiddenElement.click();

    return;
}

function makeDynamicSampleSheet() {
    let csv = 'expName,date,module,seqInfo,experimentalist,watchers\n';
    csv += expName + ',' + date.toISOString().split('T')[0] + ',' + module + ',' + sequencingInfo + ',' + experimentalist + ',' + stakeholders

    // possibly add each sample on end (would need to dynamically create headers or put in brackets idk)
    // samples.forEach((x, index) => {

    //     csv += x.join(',')
    // })

    let fileName = expName + 'Info.csv'
    let csvDataDynamic = new Blob([csv], { type: 'text/csv' });
    csvFileToPass = new FormData()
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
                0: { text: 'Sample_ID', style: 0},
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
                3: { text: 'CGATCATG'},
                4: { text: 'CGATCATG'},
                5: { text: 'AAGTAGAG'},
                6: { text: 'AAGTAGAG'},
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

