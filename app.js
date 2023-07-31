const http = require('http');

// const hostname = 'srv-hpc01';
const hostname = '10.72.20.80';
// const hostname = 'localhost';


// const port = 3001;
const port = 3317;


const express = require('express'),
  morgan = require('morgan'),
  app = express(),
  path = require('path'),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  formidable = require('formidable'),
  Readable = require('stream'),
  cors = require('cors'),
  util = require('util');
require('dotenv').config();
const { Client } = require('ssh2')
// const JiraClient = require("jira-connector");
const JiraApi = require('jira-client');
// const FormData = require('form-data');
const fs = require('fs');
// const Blob = require('blob')


// Express App
let public_dir = path.join(__dirname, 'public');

const { response, request } = require("express");
const { type } = require('os');


// Define the SSH configuration for the remote server
const sshConfig = {
  host: '10.72.20.95',
  port: 22,
  username: process.env.SSH_USERNAME,
  password: process.env.SSH_PASSWORD
}

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// might need body parser
app.use(express.static('public'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
})

// setup sql
const sqlite3 = require('sqlite3').verbose();
let sql;

// const db = new sqlite3.Database('./vars.db', sqlite3.OPEN_READWRITE, (err) => {
//   if (err) return console.error(err.message)
// });

// const KeyvSqlite = require('@keyvhq/sqlite')
// const Keyv = require('@keyvhq/core')

// const keyv = new Keyv({
//   store: new KeyvSqlite('./vars.db')
// })

async function test() {
  await keyv.set('foo', 'hello')
  let me = await keyv.get('foo')
  console.log(me)
  keyv.clear()
}

// test()

// db.run("DROP TABLE variables")

// sql = `CREATE TABLE variables(id TEXT PRIMARY KEY, var_values)`
// db.run(sql)

// // insert Data
// sql = `INSERT INTO variables(id,var_values) VALUES (?,?)`
// db.run(sql, ['trackingNum', '1'], (err) => {
//   if (err) return console.error(err.message)
// })

// // update data
// sql = `UPDATE variables SET var_values = ? WHERE id = ?`
// db.run(sql, ['2', 'trackingNum'], (err) => {
//   if (err) return console.error(err.message)
// })

// // query Data
// sql = `SELECT * FROM variables`
// db.all(sql, [], (err, rows) => {
//   if (err) return console.error(err.message)
//   rows.forEach((row) => {
//     console.log(row)
//   })
// })


/*
*
* SET UP NANOPORE MASTER DATABASE
*
*/
const db = new sqlite3.Database('./masterSheet.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error(err.message)
});

// sql = `CREATE TABLE nanoporeMasterList(id TEXT PRIMARY KEY, flowcell, run_date)`
// db.run(sql)

// add something to db
// sql = `INSERT INTO nanoporeMasterList(id,flowcell,run_date) VALUES (?,?,?)`
// db.run(sql, ['trackingNum', 'testFlowcell', '2023-MM-DD'], (err) => {
//   if (err) return console.error(err.message)
// })

// sql = `SELECT * FROM nanoporeMasterList`
// db.all(sql, [], (err, rows) => {
//   if (err) {
//     console.error(err.message)
//   } else {
//     rows.forEach(row => {
//       console.log(row)
//     })
//   }
// })

// delete something from db
// db.run('DELETE FROM nanoporeMasterList WHERE id="NANOSEQX"')



app.get('/getMasterDB', (req, res) => {

  sql = `SELECT * FROM nanoporeMasterList`
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message)
      res.status(500).send('Get Master DB error')
    } else {
      res.json(rows)
    }
  })
})

app.post('/addMasterDB', bodyParser.json(), (req, res) => {

  // Assuming you have a valid database connection
  const sql = `INSERT INTO nanoporeMasterList (id, flowcell, run_date) VALUES (?, ?, ?)`;
  const params = [req.body.id, req.body.flowcell, req.body.run_date];

  // Check if ID is from TES and reject if it is?
  if (params[0].slice(0, 3) == "TES") {
    console.log("DENIED MASTERDB")
    res.sendStatus(200)
  } else {
    db.run(sql, params, function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error: Adding run to master db');
      } else {
        res.sendStatus(200);
      }
    });
  }


});


const { exec } = require("child_process");

exec("pwd", (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});


const execPromise = util.promisify(exec)

const { spawn } = require("child_process");

// const ls = spawn("ls", ["-la"]);

// ls.stdout.on("data", data => {
//     console.log(`stdout: ${data}`);
// });

// ls.stderr.on("data", data => {
//     console.log(`stderr: ${data}`);
// });

// ls.on('error', (error) => {
//     console.log(`error: ${error.message}`);
// });

// ls.on("close", code => {
//     console.log(`child process exited with code ${code}`);
// });

let jira = new JiraApi({
  protocol: "http",
  host: "10.78.50.65",
  port: "8080",
  username: process.env.JIRA_USERNAME,
  password: process.env.JIRA_PASSWORD,
  strictSSL: false
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  // res.send("starts new nodejs project")

})

app.get('/nanoTS', (req, res) => {
  res.sendFile(__dirname + '/public/nanoTS.html');
  // res.send("starts new nodejs project")

})

// dont know group name or have admin privlidges?
app.get('/getUsers', (req, res) => {

  // returns status 404
  jira.getUsers().then(result => {
    console.log(result)
    res.send(result);
  }).catch(err => {
    console.log(err)
  })
  // or
  // jira.getUsersInGroup('groupname').then(result => {
  //   res.send(result);
  // }).catch(err => {
  //   console.log(err)
  // })
})

// needs board to get epics from (likley to be preset)
app.get('/getEpics', (req, res) => {
  jira.getEpics('107', 0, 200, 'false').then(result => {
    // console.log(result)
    res.send(result);
  }).catch(err => {
    console.log('Get Epics Err', err)
  })
})

//pacbio is board '38'
//tes is board '102'
//Test-Global-Seq-Board '107'

// needs board to get epics from (likley to be preset)
app.get('/getIssues', (req, res) => {
  jira.getIssuesForBoard('107', 0, 200).then(result => {
    // console.log(result)
    res.send(result);
  }).catch(err => {
    console.log('Get Issues Err', err)
  })
})


app.get('/nanoIndexNumber', async (req, res) => {

  // check JIRA NanoSeq directory to get the highest Issue id
  // let jql = `project=TES ORDER BY created DESC`;
  let jql = `project=NANOSEQ ORDER BY created DESC`;

  let testingMode = req.query.testing
  console.log('what am I working with')
  console.log(req.query.testing)
  
  if (testingMode) {
    console.log('Why am I here')
    console.log(typeof testingMode)
    console.log(testingMode)
    jql = `project=TES ORDER BY created DESC`;
  }

  await jira.searchJira(jql, { maxResults: 1 })
    .then(issues => {
      const latestIssue = issues.issues[0];
      if (latestIssue) {
        console.log(`Latest issue key: ${latestIssue.key}`);
        // send highest key
        res.send({ key: latestIssue.key })
      } else {
        res.send({ key: 'NANOSEQ-0' })
      }

    })
    .catch(err => {
      console.error(err);
      res.status(500).send({ error: 'An error occured while retrieving the latest issue number' })
    });


  // need a function for retrieving that variable and sending it to samplesheet
  // should remove ability to set the project Name (cannot be visible in case 
  // someone else submits a job at same time)


})


// app.get('/jsonxexcel', (req, res) => {

// })


/*
* cmd to make an issue
*/
app.post('/makeIssue', bodyParser.json(), (req, res) => {

  let issueObject = {
    fields: {
      project: {
        key: req.body.project // uncomment when ready
        // key: "TES"
      },
      // summary: "Portal Jira Testing (Delete)",
      summary: req.body.summary,
      description: req.body.info,
      issuetype: {
        name: req.body.category
        // name: "Task"
      },
      assignee: {
        name: req.body.user // uncomment when ready
        // name: 'apecorale'
      },
      customfield_10100: req.body.assignToEpic, // field for assigning epics
      labels: req.body.tags,
      function(error, issue) {
        console.log("error: ", error);
        console.log("issue: ", issue)
      }
    }
  }

  let date = new Date()
  date = date.toISOString().split("T")[0]

  if (req.body.project === 'MISEQ' || req.body.project === 'TES') {
    issueObject.fields.customfield_10300 = date
  }

  jira.addNewIssue(issueObject).then(result => {
    console.log('Result', result)
    let resultKey2 = result.key

    // add watchers seperatly after

    if (req.body.watchers) {

      req.body.watchers.forEach(async (user) => {
        try {
          await jira.addWatcher(resultKey2, user).then(result2 => { res.send(result2) })
        } catch (err) {
          console.log("Adding Watchers Error")
          console.log(err)
        }
      })

    }


    // add linked Issue stuff
    // if (req.body.linkIssue) {
    /*req.body.linkIssue.forEach(async (linkTo) => {
 
      let link = {}
      switch (req.body.howLink) {
        case 'blocks':
          link = {
            "name": 'Blocks',
            "inward": 'Blocks',
            "outward": 'Blocked By'
          }
          break;
 
        case 'blockedBy':
          link = {
            "name": 'Blocked By',
            "inward": 'Blocked By',
            "outward": 'Blocks'
          }
          break;
 
        case 'clones':
          link = {
            "name": 'Clones',
            "inward": "Clones",
            "outward": "Cloned by"
          }
          break;
      }
 
      let input = {
        "type": link,
        "inwardIssue": resultKey2,
        "outwardIssue": linkTo
      }
      await jira.issueLink(input).then(result3 => { res.send(result3) })
    })*/
    // }

    res.send(result);
  }).catch(err => {
    console.log(err)
  })
})


app.post('/startLiveBasecalling', bodyParser.json(), (req, res) => {
  // Parse the JSON input
  const cmd = req.body.cmd;

  // Create an SSH client
  const sshClient = new Client();

  // Connect to the remote server
  sshClient.on('ready', () => {
    console.log('Connected to remote server');
    // Execute the command on the remote server
    sshClient.exec(cmd, (err, stream) => {
      if (err) {
        console.error(`Error executing command on remote server: ${cmd}`);
        console.error(err);
        res.status(500).send('Failed to start live basecalling process on remote server');
      } else {
        console.log(`Live basecalling process started on remote server with command: ${cmd}`);
        res.status(200).send('Live basecalling process started successfully on remote server');
      }
      // Close the SSH client connection
      sshClient.end();
    });
  });

  sshClient.on('error', (err) => {
    console.error('Failed to connect to remote server');
    console.error(err);
    res.status(500).send('Failed to connect to remote server');
  });

  // Connect to the remote server with the SSH configuration
  sshClient.connect(sshConfig);
});



app.put('/updateIssue', bodyParser.json(), (req, res) => {
  console.log("Made to put: ", req.body)

  let id = req.body.id // turned off for saftey
  // let id = "TEST-3"

  let labelsArr = []
  req.body.tags.forEach(tag => {
    let obj = { add: tag }
    labelsArr.push(obj)
  })

  // how do we put conditionals inside of object?
  let updateBody = {
    // dont think we want to utilize fields at all 
    // might overwrite everything.. can we do everything in update
    // fields: {
    //   description: req.body.info, // find way to add text to description/not replace completely

    //   // need to check that what we're assigning is not empty
    //   // customfield_10100: req.body.assignToEpic, // field for assigning epics

    // },
    update: {
      labels: labelsArr,
    }
  }

  jira.updateIssue(id, updateBody).then(async result => {
    console.log('Result', result)

    // add comments seperatly
    try {
      await jira.addComment(id, req.body.info).then(res2 => res.send(res2))
    } catch (err) {
      console.log('Add Comment Error')
      console.log('err')
    }


    // add watchers seperatly
    // cannot add watcher apparently
    if (req.body.watchers) {

      req.body.watchers.forEach(async (user) => {
        try {
          await jira.addWatcher(id, user).then(res3 => { res.send(res3) })
        } catch (err) {
          console.log("Adding Watchers Error")
          console.log(err)
        }
      })

    }

    // add linked Issue stuff
    // if (req.body.linkIssue) {
    /*req.body.linkIssue.forEach(async (linkTo) => {
 
      let link = {}
      switch (req.body.howLink) {
        case 'blocks':
          link = {
            "name": 'Blocks',
            "inward": 'Blocks',
            "outward": 'Blocked By'
          }
          break;
 
        case 'blockedBy':
          link = {
            "name": 'Blocked By',
            "inward": 'Blocked By',
            "outward": 'Blocks'
          }
          break;
 
        case 'clones':
          link = {
            "name": 'Clones',
            "inward": "Clones",
            "outward": "Cloned by"
          }
          break;
      }
 
      let input = {
        "type": link,
        "inwardIssue": resultKey2,
        "outwardIssue": linkTo
      }
      await jira.issueLink(input).then(result3 => { res.send(result3) })
    })*/
    // }

    res.send(result);
  }).catch(err => {
    console.log(err)
  })
})

/*
* Multer temp Storage location 1
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/data/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const Data = multer({ storage: storage });

/*
* Used for temporary attachment uploads (saves them in ./public/data/uploads)
* adds them as an attachment to prexisting issue
* Need cronjob to clear directory periodically or after successfull upload
*/
app.post('/addAttachment2Issue', Data.any("files"), (req, res, next) => {

  // console.log("Req: ", req)

  // might want to move this section to seperate fxn/promise w/ await
  // also might want to uncomment the return idk
  if (req.files.length !== 0) {
    req.files.forEach(x => {

      fs.mkdirSync("/HPC/SAN-HPEMSA02/genomics/reference_genome/sequencing_portal/" + req.body.jiraId, { recursive: true })
      fs.copyFile(x.path, "/HPC/SAN-HPEMSA02/genomics/reference_genome/sequencing_portal/" + req.body.jiraId + "/" + x.path.split('/')[3], (err) => {
        if (err) {
          console.log("Error found: ", err)
        }
      })

      jira.addAttachmentOnIssue(req.body.jiraId, fs.createReadStream(x.path)).then(result => {
        console.log('Result', result)
        res.send(result);
      }).catch(err => {
        console.log(err)
        //return
      })
    })
  }


  // Catches all files already uploaded to references and adds them to jira ticket
  if (req.body.arr) {
    req.body.arr.forEach(x => {

      fs.mkdirSync("/HPC/SAN-HPEMSA02/genomics/reference_genome/sequencing_portal/" + req.body.jiraId, { recursive: true })
      fs.copyFile("./References/" + x, "/HPC/SAN-HPEMSA02/genomics/reference_genome/sequencing_portal/" + req.body.jiraId + "/" + x, (err) => {
        if (err) {
          console.log("Error found: ", err)
        }
      })

      jira.addAttachmentOnIssue(req.body.jiraId, fs.createReadStream('./References/' + x)).then(result => {
        console.log('Result', result)
        res.send(result);
      }).catch(err => {
        console.log(err)
        //return
      })

    })
  }

  // upload nanopore samplesheet from URL
  if (req.body.nanoSampURL) {

    jira.addAttachmentOnIssue(req.body.jiraId, fs.createReadStream('./NanoporeSampleSheets/' + req.body.nanoSampURL)).then(result => {
      console.log('Result', result)
      res.send(result);
    }).catch(err => {
      console.log(err)
      //return
    })

  }


  if (res.status(200)) {
    console.log("Your file has been uploaded successfully.");
    console.log(req.files);
    res.json({ message: "Successfully uploaded files" });
    res.end();

    // use exec() to remove file from the staging upload space
  }
})


// ***** Make function that stores the downloaded sample sheet file
// ***** to a seperate location that will have a cron job sweeping it
// ***** (Later - make seperate locations for miseq and nanopore sample sheets to go to) 
//
//

/*
* Multer temp Storage location 1
*/
const storageSampleSheet = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./SampleSheets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const SampleSheetData = multer({ storage: storageSampleSheet });


/*
* Used for temporary attachment uploads (saves them in ./public/data/uploads)
* adds them as an attachment to prexisting issue
* Need cronjob to clear directory periodically or after successfull upload
*/
app.post('/downloadSampleSheet', SampleSheetData.any('files'), (req, res, next) => {

  if (res.status(200)) {
    console.log("Your file has been uploaded successfully.");
    console.log(req.files);
    res.json({ message: "Successfully uploaded files" });
    res.end();

    // use exec() or cron job to move file around cluster


  } else {
    console.log('/downloadSampleSheet failed')
    console.log(res)
  }

})


/*
* Multer temp Storage location 1
*/
const storageNanoSampleSheet = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./NanoporeSampleSheets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const NanoSampleSheetData = multer({ storage: storageNanoSampleSheet });


/*
* Used for temporary attachment uploads (saves them in ./public/data/uploads)
* adds them as an attachment to prexisting issue
* Need cronjob to clear directory periodically or after successfull upload
*/
app.post('/downloadNanoSampleSheet', NanoSampleSheetData.any('files'), async (req, res, next) => {

  try {
    if (res.status(200)) {
      console.log("Your file has been uploaded successfully.");
      console.log(req.files);

      // await execPromise('python pyScripts/EXCELxJSON.py -i NanoporeSampleSheets/hello_2023_04_03_SampleSheet.json --excel')
      await execPromise('python pyScripts/EXCELxJSON.py -i ' + req.files[0].path + ' --excel --pipe -o ' + req.files[0].path.split('.')[0])

      res.json({ message: "Successfully uploaded files" });
      res.end();

      // use exec() or cron job to move file around cluster


    } else {
      console.log('/downloadNanoSampleSheet failed')
      console.log(res)
    }
  } catch (error) {
    console.error('An error occured with EXCELxJSON')
    res.status(500).json({ message: "Error occurred while processing the request" })
  }
})


/*
* Multer temp Storage location 1
*/
const storageReferences = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./References");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});


const ReferencesData = multer({ storage: storageReferences });


function refUpload(req, res, next) {
  let storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
      let path = "/HPC/SAN-HPEMSA02/genomics/reference_genome/sequencing_portal/" + req.body.jiraId
      fs.mkdirSync(path, { recursive: true })
      cb(null, path);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const Data2 = multer({ storage: storage2 });

  ReferencesData.any('files')(req, res, next);
  Data2.any('files')(req, res, next);
  next();
}
/*
* Used for temporary attachment uploads (saves them in ./public/data/uploads)
* adds them as an attachment to prexisting issue
* Need cronjob to clear directory periodically or after successfull upload
*/
app.post('/downloadReference', refUpload, (req, res, next) => {


  if (res.status(200)) {
    console.log("Your file has been uploaded successfully.");
    console.log(req.files);
    res.json({ message: "Successfully uploaded files" });
    res.end();

    // use exec() or cron job to move file around cluster

  } else {
    console.log('/downloadSampleSheet failed')
    console.log(res)
  }

})

app.get('/getListReferences', (req, res) => {
  let list = [];
  // change Reference location to more central reference location when applicable
  exec("cd References; ls", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    list = stdout.split('\n')
    list.pop()
    res.send({ references: list })
  });

})


/*
* Get specific ticket
* call using /getTicket?issue_key=KEY-1
*/
app.get('/getTicket', (req, res) => {
  jira.getIssue(req.query.issue_key).then(result => {
    res.send(result);
  }).catch(err => {
    console.log(err)
  })
})


// Add a health check route in express
app.get('/_health', (req, res) => {
  res.status(200).send('ok')
})


app.listen(process.env.PORT || port, hostname, () => console.log("listening on port ", port));

// register view engine
// app.set('view engine', 'ejs');

// app.get('/', (req, res) => {
//     res.redirect('/index')
// })

// app.get('/index', async (req, res) => {
//     res.render('index')
// })