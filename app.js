const http = require('http');

const hostname = 'srv-hpc01';
const port = 3001;

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

const {response, request} = require("express");
const { type } = require('os');


app.use(cors());
app.use(express.urlencoded({extended: true}));
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
  res.sendFile(__dirname+'/index.html');
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
  jira.getEpics('38', 0, 50, 'false').then(result => {
    // console.log(result)
    res.send(result);
  }).catch(err => {
    console.log('Get Epics Err', err)
  })
})

// needs board to get epics from (likley to be preset)
app.get('/getIssues', (req, res) => {
  jira.getIssuesForBoard('38', 0, 50).then(result => {
    // console.log(result)
    res.send(result);
  }).catch(err => {
    console.log('Get Issues Err', err)
  })
})

app.post('/makeIssue', bodyParser.json(), (req, res) => {
  console.log(req.body)

  jira.addNewIssue({
    fields: {
      project: {
        key: "TES"
      },
      summary: "Portal Jira Testing (Delete)",
      description: req.body.info,
      issuetype: {
        name: "Task"
      },
      assignee: {
        //name: req.body.user
        name: 'apecorale'
      },
      function(error, issue) {
        console.log("error: ", error);
        console.log("issue: ", issue)
    }
  }
  }).then(result => {
    console.log('Result', result)
    res.send(result);
  }).catch(err => {
    console.log(err)
  })
})

// let editBody = {
  // "historyMetadata": {
  //   "actor": {
  //     "avatarUrl": "http://mysystem/avatar/tony.jpg",
  //     "displayName": "Tony",
  //     "id": "tony",
  //     "type": "mysystem-user",
  //     "url": "http://mysystem/users/tony"
  //   },
  //   "extraData": {
  //     "Iteration": "10a",
  //     "Step": "4"
  //   },
  //   "description": "Updating an Issue Test",
  //   "generator": {
  //     "id": "mysystem-1",
  //     "type": "mysystem-application"
  //   },
  //   "cause": {
  //     "id": "myevent",
  //     "type": "mysystem-event"
  //   },
  //   "activityDescription": "Complete order processing",
  //   "type": "myplugin:type"
  // },
  // update: {
  //   summary: [
  //     {
  //       set: "This is a test Update to an issue"
  //     }
  //   ],
  //   components: [
  //     {
  //       set: "Aidan-Component"
  //     }
  //   ],
  //   // timetracking: [
  //   //   {
  //   //     edit: {
  //   //       remainingEstimate: "4d",
  //   //       originalEstimate: "1w 1d"
  //   //     }
  //   //   }
  //   // ],
  //   labels: [
  //     {
  //       add: "triaged"
  //     },
  //     {
  //       remove: "blocker"
  //     }
  //   ]
  // },
//   fields: {
//     summary: "Completed orders still displaying in pending",
//     customfield_10000: {
//       type: "doc",
//       version: 1,
//       content: [
//         {
//           type: "paragraph",
//           content: [
//             {
//               text: "Investigation underway",
//               type: "text"
//             }
//           ]
//         }
//       ]
//     }
//   },
//   properties: [
//     {
//       "value": "Order number 10784",
//       issueKey: "BFX-74"
//     },
//     {
//       value: "Order number 10923",
//       key: "BFX-73"
//     }
//   ],
//   function(error, issue) {
//     console.log("error: ", error);
//     console.log("issue: ", issue)
//   }
// }

app.put('/updateIssue', bodyParser.json(), (req, res) => {
  console.log("Made to put: ", req.body)

  jira.updateIssue(req.body.id, {
    fields: {
      description: req.body.info,
      //labels: ["triaged"]
    },
    update: {
      labels: [
        { add: "blocker" }
      ]
    }
    // "update": {
    //   "labels": [
    //     {
    //       "add": "triaged"
    //     }
    //   ]
    // }
  }).then(result => {
    console.log('Result', result)
    res.send(result);
  }).catch(err => {
    console.log(err)
  })
})


// let filePath = 'SampleSheet.csv'
// const fileStream = fs.createReadStream(filePath);

// app.post('/addAttachment', (req, res, next) => {
//   const form = formidable({multiples: true})
//   form.uploadDir = uploadFolder

//   form.parse(req, async (err, fields, files) => {
//     console.log("Fields", fields)
//     console.log('Files', files)
//     if (err) {
//       next(err);
//       return;
//     }
//     console.log("inside form", res.json({fields, files}))
//     res.json({fields, files})
  
//   })
//   console.log("Formidable", form)

//   jira2.addAttachmentOnIssue('TES-1', fs.createReadStream(req.file)).then(result => {
//     console.log('Result', result)
//     res.send(result);
//   }).catch(err => {
//     console.log(err)
//   })
// })


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "./public/data/uploads");
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  },
});

const Data = multer({ storage: storage });
app.post('/addAttachment2', Data.any('files'), (req, res, next) => {

  console.log("Req: ", req)

  req.files.forEach(x => {
    jira.addAttachmentOnIssue(req.body.jiraId, fs.createReadStream(x.path)).then(result => {
      console.log('Result', result)
      res.send(result);
    }).catch(err => {
      console.log(err)
    })
  })
  

  if (res.status(200)) {
    console.log("Your file has been uploaded successfully.");
    console.log(req.files);
    res.json({ message: "Successfully uploaded files" });
    res.end();
  }

})

// untested with this jira api
// app.get('/getTicketIds', (req, res) => {
//   jira.getIssue({issueKey: "BFX-74"}).then(result => {
//     res.send(result);
//   }).catch(err => {
//     console.log(err)
//   })
// })


app.listen(process.env.PORT || port, hostname, () => console.log("listening on port 3001"));
// register view engine
// app.set('view engine', 'ejs');

// app.get('/', (req, res) => {
//     res.redirect('/index')
// })

// app.get('/index', async (req, res) => {
//     res.render('index')
// })