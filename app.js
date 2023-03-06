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
  cors = require('cors');
require('dotenv').config();
// const JiraClient = require("jira-connector");
const JiraApi = require('jira-client');
// const FormData = require('form-data');
const fs = require('fs');
// const Blob = require('blob')


// Express App
let public_dir = path.join(__dirname, 'public');

const { response, request } = require("express");
const { type } = require('os');


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// might need body parser
app.use(express.static('public'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
})

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
  username: "jira_api",
  password: "jira_api",
  strictSSL: false
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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

  console.log("Req: ", req)

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