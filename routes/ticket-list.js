const express = require('express');
const router = express.Router();
const dbQuery = require('./../database');
const SqlString = require('sqlstring');
const { db } = require('../config');
const bcrypt = require("bcrypt");

/**
 * Displays an alert at the top of the page showing the error message
 * 
 * @param String $text  Message to be shown in alert
 */
function showError(text) {
    return `<script>
         window.scrollTo({ top: 0, behavior: 'smooth' });
         alertBanner('${text}');
     </script>`;
}

async function hashIt(password) {
    const salt = await bcrypt.genSalt(6);
    const hashed = await bcrypt.hash(password, salt);

    return hashed;
}

router.get('/', async (req, res) => {
    // This variable will be used to store the userid when the login page has finished
    if (!req.session.userid) {
        res.redirect("login");
        return;
    }

    if (req.session.groupByProblemTypes != false && req.session.groupByProblemTypes != true) {
        req.session.groupByProblemTypes = true;
    }

    req.session.save(function (err) {
        // session saved
    })

    // Get tickets
    let sql = `SELECT Ticket.ID AS ID, CreatedTimestamp, ` +
        `(SELECT Problem FROM ProblemType WHERE Ticket.TypeID=ProblemType.ID) AS Problem,  ` +
        `(SELECT SoftwareName FROM Software WHERE Ticket.SoftwareID=Software.ID) AS Software, ` +
        `(SELECT Device FROM Hardware WHERE Ticket.HardwareID=Hardware.ID) AS Hardware, ` +
        `(SELECT FullName FROM Personnel WHERE Ticket.ReporterID=Personnel.ID) AS Reporter, ` +
        `(SELECT ID FROM Personnel WHERE Ticket.ReporterID=Personnel.ID) AS ReporterID, ` +
        `(SELECT FullName FROM Personnel WHERE ID = AssignedSpecialistID) AS AssignedSpecialist, ` +
        `(SELECT Explanation FROM Solution WHERE Ticket.FinalSolutionID=Solution.ID) AS Solution, ` +
        `TicketDescription, TicketPriority, ResolvedTimestamp, TicketState, AssignedSpecialistID ` +
        `FROM Ticket HAVING ` +
        (req.session.deptid == 6 ? '' : `ReporterID = ${req.session.userid} AND `) +
        `(ResolvedTimestamp IS NULL OR ResolvedTimestamp + INTERVAL 1 DAY >= now()) ORDER BY TicketPriority DESC`;
    let tickets = await dbQuery(sql);
    // Get problem types
    let problemTypes = await dbQuery('SELECT * FROM ProblemType');
    // Get personnel
    sql = `SELECT ID, FullName, PhoneNo, Dept, (SELECT ID IN ` +
        `(SELECT PersonnelID FROM Holidays WHERE ` +
        `(StartDate <= CURRENT_DATE AND EndDate > CURRENT_DATE))) AS OnHoliday FROM Personnel`;
    let personnel = await dbQuery(sql);
    // Get software
    sql = 'SELECT * FROM Software';
    let software = await dbQuery(sql);
    // Get hardwware
    sql = 'SELECT * FROM Hardware';
    let hardware = await dbQuery(sql);
    // Get specialists
    sql = `SELECT PersonID, ` +
        `GROUP_CONCAT((SELECT Problem FROM ProblemType WHERE ID = SpecialtyID)) AS Problem, ` +
        `(SELECT FullName FROM Personnel WHERE ID = PersonID) AS FullName, ` +
        `(SELECT COUNT(AssignedSpecialistID) FROM Ticket WHERE AssignedSpecialistID = PersonID AND TicketState != 'RESOLVED') AS Workload, ` +
        `(SELECT External FROM SpecialistActiveExternal WHERE SpecialistID = PersonID) AS External, ` +
        `(SELECT PersonID IN ` +
        `(SELECT PersonnelID FROM Holidays WHERE ` +
        `(StartDate <= CURRENT_DATE AND EndDate > CURRENT_DATE))) AS OnHoliday ` +
        `FROM Specialist ` +
        `GROUP BY PersonID ` +
        `ORDER BY External, Workload ASC`;
    let specialists = await dbQuery(sql);
    // Get solutions
    sql = 'Select * FROM Solution';
    let solutions = await dbQuery(sql);

    console.log("groupByProblemTypes: " + req.session.groupByProblemTypes);

    res.render('ticket-list', {
        tickets: tickets,
        problemTypes: problemTypes,
        personnel: personnel,
        software: software,
        hardware: hardware,
        specialists: specialists,
        solutions: solutions,
        userid: req.session.userid,
        deptid: req.session.deptid,
        groupByProblemTypes: (req.session.groupByProblemTypes == false ? false : true)
    });
});


/**
 * Inserts a row into the ticketLog table in the database with the details specified
 * 
 * @param Number ID                    Unique ID of ticket that log is related to
 * @param String LogType               Type of the log (e.g: Comment, Create, UpdateReporter,...)
 * @param String Text                  Text associated with the log
 * @param Number OriginPersonnelID     The ID of the user that caused the log
 * @param Number AssignedPersonnelID   The ID of the user that has been assigned to the ticket
 */
sendTicketLog = async (ID, LogType, Text, OriginPersonnelID, AssignedPersonnelID) => {
    // Insert row into TicketLog table in db
    sql = `INSERT INTO TicketLog ` +
        `(TicketID, LogType, OriginPersonnelID` +
        (Text ? ", Text" : '') +
        (AssignedPersonnelID ? ', AssignedPersonnelID' : '') +
        `) VALUES ('${ID}', '${LogType}', '${OriginPersonnelID}'` + (Text ? `, '${Text}'` : '') +
        (AssignedPersonnelID ? `, '${AssignedPersonnelID}'` : '') +
        ');';

    console.log(await dbQuery(sql));
}

addProblemType = async (newProblemType) => {
    let finalTypeID = 0;
    // Check if problem already exists
    if (newProblemType.length == 0) {
        showError('ERROR: Cannot add empty problem type');
        console.log('ERROR: Cannot add empty problem type');
        return -1;
    }
    sql = `SELECT Problem FROM ProblemType WHERE Problem = '${newProblemType}'`;
    let result = await dbQuery(sql);

    // If query returns results
    if (result.length > 0) {
        // Return error
        showError('ERROR: Problem type already exists');
        console.log('ERROR: Problem type already exists');
        return -1;
    } else {
        // Insert row into problemType table
        sql = `INSERT INTO ProblemType (Problem) VALUES ('${newProblemType}')`;

        result = await dbQuery(sql);
        finalTypeID = result.insertId;
    }
    return finalTypeID;
}

createNewSolution = async (newSolutionText, userid) => {
    let finalSolutionID = 0;
    // Check if problem already exists
    if (newSolutionText.length == 0) {
        showError('ERROR: Cannot add empty solution');
        console.log('ERROR: Cannot add empty solution');
        return -1;
    }

    sql = `SELECT Explanation FROM Solution WHERE Explanation = '${newSolutionText}'`;
    let result = await dbQuery(sql);

    // If query returns results
    if (result.length > 0) {
        // Return error
        showError('ERROR: Solution already exists');
        console.log('ERROR: Solution already exists');
        return -1;
    } else {
        // Insert row into problemType table
        sql = `INSERT INTO Solution ` +
            `(ProviderID, Explanation) ` +
            `VALUES ('${userid}', '${newSolutionText}')`;

        result = await dbQuery(sql);
        finalSolutionID = result.insertId;
    }
    return finalSolutionID;
}


addExternalSpecialist = async (externalSpecialistName, externalSpecialistPhoneNo, externalSpecialistPassword, externalSpecialistSpeciality) => {
    let externalSpecialistID = 0;
    // Check if problem already exists
    if (externalSpecialistName.length == 0) {
        showError('ERROR: Cannot add specialist with empty name');
        console.log('ERROR: Cannot add specialist with empty name');
        return -1;
    } else if (externalSpecialistPhoneNo.length == 0) {
        showError('ERROR: Cannot add specialist with no phone number');
        console.log('ERROR: Cannot add specialist with no phone number');
        return -1;
    } else if (externalSpecialistPassword.length == 0) {
        showError('ERROR: Cannot add specialist with no password');
        console.log('ERROR: Cannot add specialist with no password');
        return -1;
    } else if (externalSpecialistSpeciality.length == 0) {
        showError('ERROR: Cannot add specialist with no speciality');
        console.log('ERROR: Cannot add specialist with no speciality');
        return -1;
    }

    sql = `SELECT username FROM Personnel WHERE username = '${externalSpecialistName}'`;
    let result = await dbQuery(sql);

    // If query returns results
    if (result.length > 0) {
        // Return error
        showError('ERROR: External specialist already exists');
        console.log('ERROR: External specialist already exists');
        return -1;
    } else {
        externalSpecialistPassword = await hashIt(externalSpecialistPassword);
        let username = (externalSpecialistName.replace('/\s/', '')).substring(0, 15);
        // Insert row into personnel table
        sql = `INSERT INTO Personnel (Username, FullName, Job, Dept, PhoneNo, PasswordHash) VALUES ` +
            `('${username}', '${externalSpecialistName}', 'External Specialist', '6', '${externalSpecialistPhoneNo}', '${externalSpecialistPassword}');`;

        result = await dbQuery(sql);

        let assignedSpecialistID = result.insertId;

        sql = `INSERT INTO Specialist (PersonID, SpecialtyID) VALUES 
                        ('${assignedSpecialistID}','${externalSpecialistSpeciality}');`;
        externalSpecialistID = result.insertId;

        result = await dbQuery(sql);

        sql = `INSERT INTO SpecialistActiveExternal (SpecialistID, External) VALUES ` +
            `('${assignedSpecialistID}','1');`

        result = await dbQuery(sql);
    }
    return externalSpecialistID;
}

router.post('/', async (req, res) => {
    // This variable will be used to store the userid when the login page has finished

    if (req.session.userid < 1) {
        res.redirect("login");
    }

    let finalTypeID = 0;
    let finalSolutionID = 0;
    let finalSpecialistID = 0;

    switch (req.body.form_type) {

        case "create-ticket":
            // If user is adding a new problem type
            if (req.body.typeID == -1) {
                finalTypeID = await addProblemType(req.body.newCreateTypeText);
                if (finalTypeID == -1) break;
            } else if (req.body.typeID != 0) {
                // Set type ID of ticket to chosen problem type
                finalTypeID = req.body.typeID;
            }

            sql = `INSERT INTO Ticket ` +
                `(TicketPriority, TypeID, TicketDescription, ReporterID` +
                (req.body.softwareID > 0 ? ', SoftwareID' : '') +
                (req.body.hardwareID > 0 ? ', HardwareID' : '') +
                `) VALUES ('${req.body.ticketPriority}', '${finalTypeID}', '${req.body.ticketDescription}', '${req.session.userid}'` +
                (req.body.softwareID > 0 ? `, '${req.body.softwareID}'` : '') +
                (req.body.hardwareID > 0 ? `, '${req.body.hardwareID}'` : '') + ')';

            console.log(await dbQuery(sql));
            break;
        case "update-ticket":
            // If user is adding a new problem type
            if (req.body.typeID == -1) {
                finalTypeID = await addProblemType(req.body.newTypeText);
                if (finalTypeID == -1) break;
            } else if (req.body.typeID != 0) {
                // Set type ID of ticket to chosen problem type
                finalTypeID = req.body.typeID;
            }

            if (req.body.assignedSpecialistID == -1) {
                finalSpecialistID = await addExternalSpecialist(req.body.newExternalSpecialistText,
                    req.body.newExternalSpecialistPhoneNo, req.body.newExternalSpecialistPassword,
                    req.body.newExternalSpecialistSpeciality)
                if (finalSpecialistID == -1) break;
            } else if (req.body.assignedSpecialistID != 0) {
                finalSpecialistID = req.body.assignedSpecialistID;
            }

            // If user is adding a new solution
            if (req.body.finalSolutionID == -1) {
                finalSolutionID = await createNewSolution(req.body.newSolutionText, req.session.userid);
                if (finalSolutionID == -1) break;
            } else if (req.body.finalSolutionID != 0) {
                // Set type ID of ticket to chosen problem type
                finalSolutionID = req.body.finalSolutionID;
            }

            console.log("finalSolutionID: " + finalSolutionID);

            sql = `SELECT * FROM Ticket WHERE ID = ${req.body.ID}`;
            let ticketDetails = (await dbQuery(sql))[0];

            sql = `UPDATE Ticket SET ` +
                `TicketPriority = '${req.body.ticketPriority}', ` +
                `TypeID = '${finalTypeID}', ` +
                `TicketDescription = '${req.body.ticketDescription}', ` +
                `TicketState = '${req.body.ticketState}', ` +
                `ReporterID = '${req.body.reporterID}', ` +
                `AssignedSpecialistID = ` + (finalSpecialistID > 0 ? "'" + finalSpecialistID + "'" : 'NULL') + `, ` +
                `SoftwareID = ` + (req.body.softwareID > 0 ? "'" + req.body.softwareID + "'" : 'NULL') + `, ` +
                `FinalSolutionID = ` + (finalSolutionID > 0 ? "'" + finalSolutionID + "'" : 'NULL') + `, ` +
                `HardwareID = ` + (req.body.hardwareID > 0 ? "'" + req.body.hardwareID + "'" : 'NULL') +
                (req.body.ticketState == "RESOLVED" ? ", ResolvedTimestamp = CURRENT_TIMESTAMP" : "") +
                ` WHERE ID = ${req.body.ID}`;

            console.log(await dbQuery(sql));

            /* 
                For each field on the ticket: if it has been changed, add a row to the TicketLog 
                table showing the updates that have been made to the ticket
            */
            if (req.body.typeID && ticketDetails.TypeID != req.body.typeID) {
                sendTicketLog(req.body.ID, 'UpdateProblemType', req.body.typeID, req.session.userid, null);
            }
            if (ticketDetails.TicketDescription != req.body.ticketDescription) {
                sendTicketLog(req.body.ID, 'UpdateDescription', req.body.ticketDescription, req.session.userid, null);
            }
            if (ticketDetails.ReporterID != req.body.reporterID) {
                sendTicketLog(req.body.ID, 'UpdateReporter', null, req.session.userid, req.body.reporterID);
            }
            if (ticketDetails.TicketPriority != req.body.ticketPriority) {
                sendTicketLog(req.body.ID, 'UpdatePriority', req.body.ticketPriority, req.session.userid, null);
            }
            if (ticketDetails.TicketState != req.body.ticketState) {
                sendTicketLog(req.body.ID, 'UpdateState', req.body.ticketState, req.session.userid, null);
            }
            if ((ticketDetails.AssignedSpecialistID > 0 && req.body.assignedSpecialistID == 0) && ticketDetails.AssignedSpecialistID != req.body.assignedSpecialistID) {
                sendTicketLog(req.body.ID, 'Unassign', "specialist", req.session.userid, null);
            } else if ((ticketDetails.AssignedSpecialistID > 0 || req.body.assignedSpecialistID > 0) && ticketDetails.AssignedSpecialistID != req.body.assignedSpecialistID) {
                sendTicketLog(req.body.ID, 'UpdateSpecialist', null, req.session.userid, finalSpecialistID);
            }
            if ((ticketDetails.SoftwareID > 0 && req.body.softwareID == 0) && ticketDetails.SoftwareID != req.body.softwareID) {
                sendTicketLog(req.body.ID, 'Unassign', "software", req.session.userid, null);
            } else if ((ticketDetails.SoftwareID > 0 || req.body.softwareID > 0) && ticketDetails.SoftwareID != req.body.softwareID) {
                sendTicketLog(req.body.ID, 'UpdateSoftware', req.body.softwareID, req.session.userid, null);
            }
            if ((ticketDetails.HardwareID > 0 && req.body.hardwareID == 0) && ticketDetails.HardwareID != req.body.hardwareID) {
                sendTicketLog(req.body.ID, 'Unassign', "hardware", req.session.userid, null);
            } else if ((ticketDetails.HardwareID > 0 || req.body.hardwareID > 0) && ticketDetails.HardwareID != req.body.hardwareID) {
                sendTicketLog(req.body.ID, 'UpdateHardware', req.body.hardwareID, req.session.userid, null);
            }
            if (req.body.finalSolutionID > 0 && ticketDetails.FinalSolutionID != req.body.finalSolutionID) {
                sendTicketLog(req.body.ID, 'AddSolution', req.body.finalSolutionID, req.session.userid, null);
            }
            break;
    }

    res.redirect('/ticket-list');
});


module.exports = router;