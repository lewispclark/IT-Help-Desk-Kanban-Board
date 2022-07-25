const express = require('express');
const router = express.Router();
const dbQuery = require('./../database');


router.post('/', async (req, res) => {
    if (!req.body.functionname) {
        res.send("Error: functionname not set");
        return;
    }

    let sql;
    let result;
    let params = JSON.parse(req.body.arguments)

    switch (req.body.functionname) {
        case "getTicketDetails":
            sql = `SELECT *, (SELECT PhoneNo FROM Personnel WHERE ID = ReporterID) AS ReporterNo` +
                `, (SELECT PhoneNo FROM Personnel WHERE ID = AssignedSpecialistID) AS SpecialistNo` +
                ` FROM Ticket` +
                ` WHERE ID = ${params.ticketID}`;
            result = await dbQuery(sql);
            res.send(result[0]);
            break;
        case "getTicketLogs":
            sql = `SELECT *, ` +
                `(SELECT FullName FROM Personnel WHERE ID = OriginPersonnelID) AS OriginPersonnel, ` +
                `(SELECT FullName FROM Personnel WHERE ID = AssignedPersonnelID) AS AssignedPersonnel, ` +
                `CASE ` +
                `WHEN LogType = 'UpdateProblemType' THEN(SELECT Problem FROM ProblemType WHERE ID = Text) ` +
                `WHEN LogType = 'UpdateSoftware' THEN(SELECT SoftwareName FROM Software WHERE ID = Text) ` +
                `WHEN LogType = 'UpdateHardware' THEN(SELECT CONCAT(Make, ' ', Device) FROM Hardware WHERE ID = Text) ` +
                `WHEN LogType = 'AddSolution' THEN(SELECT Explanation FROM Solution WHERE ID = Text) ELSE Text ` +
                `END AS Text ` +
                `FROM TicketLog ` +
                `WHERE TicketID = ${params.ticketID} ` +
                `ORDER BY LogTimestamp DESC`;

            result = await dbQuery(sql);
            res.send(result);
            break;
        case "removeTicketResolvedDate":
            sql = `UPDATE Ticket ` +
                `SET ResolvedTimestamp = NULL ` +
                `WHERE ID = ${params.ticketID}`;

            result = await dbQuery(sql);
            res.send(result);
            break;
        case "addComment":
            sql = `INSERT INTO TicketLog ` +
                `(TicketID, LogType, OriginPersonnelID, Text) ` +
                `VALUES ` +
                `('${params.ticketID}', 'Comment', '${params.userid}', '${params.Text}'); `;

            result = await dbQuery(sql);
            sql = `SELECT *, (SELECT FullName FROM Personnel WHERE ID = OriginPersonnelID) AS OriginPersonnel FROM TicketLog WHERE ID = ${result.insertId}`;
            result = await dbQuery(sql);
            res.send(result[0]);
            break;
        case "getPhoneNo":
            sql = `SELECT PhoneNo FROM Personnel ` +
                `WHERE ID = '${params.personnelID}'`;

            result = await dbQuery(sql);
            res.send(result[0]);
            break;
        case "setTicketResolvedDate":
            sql = `UPDATE Ticket ` +
                `SET ResolvedTimestamp = CURRENT_TIMESTAMP ` +
                `WHERE ID = ${params.ticketID}`;

            result = await dbQuery(sql);
            res.send(result);
            break;
        case "updateTicketState":
            sql = `UPDATE Ticket ` +
                `SET TicketState = '${params.ticketState}'` +
                `WHERE ID = ${params.ticketID}`;

            result = await dbQuery(sql);

            sql = `INSERT INTO TicketLog 
            (TicketID, LogType, Text, OriginPersonnelID )
            VALUES 
            ('${params.ticketID}', 'UpdateState', '${params.ticketState}', '${req.session.userid}');`;

            console.log(await dbQuery(sql));

            res.send(result);
            break;
        case "updateTicketType":
            if (!req.session.groupByProblemTypes) {
                console.log("group by problem types = false")
                break
            };
            sql = `UPDATE Ticket ` +
                `SET TypeID = ${params.typeID} ` +
                `WHERE ID = ${params.ticketID}`;

            result = await dbQuery(sql);

            sql = `INSERT INTO TicketLog 
            (TicketID, LogType, Text, OriginPersonnelID )
            VALUES 
            ('${params.ticketID}', 'UpdateProblemType', '${params.typeID}', '${req.session.userid}');`;

            console.log(await dbQuery(sql));

            res.send(result);
            break;
        case "setGroupByProblemTypes":
            req.session.groupByProblemTypes = params.checked;

            res.send("groupByProblemTypes set to " + req.session.groupByProblemTypes)
            break;
        case "addArchiveTicketInfo":

            // find ticket description and solution in db
            sql = `SELECT Ticket.TicketDescription, Solution.Explanation, ` +
                `(SELECT FullName FROM Personnel WHERE Personnel.ID = Ticket.ReporterID) AS Reporter, ` +
                `(SELECT ID FROM Personnel WHERE Personnel.ID = Ticket.ReporterID) AS ReporterID, ` +
                `(SELECT FullName FROM Personnel WHERE Personnel.ID = Ticket.AssignedSpecialistID) AS AssignedSpecialist, ` +
                `(SELECT Job FROM Personnel WHERE Personnel.ID = Ticket.ReporterID) AS Job, ` +
                `(SELECT PhoneNo FROM Personnel WHERE Personnel.ID = Ticket.ReporterID) as PhoneNo, ` +
                `(SELECT Job FROM Personnel WHERE Personnel.ID = Ticket.AssignedSpecialistID) AS SpecialistJob, ` +
                `(SELECT PhoneNo FROM Personnel WHERE Personnel.ID = Ticket.AssignedSpecialistID) as SpecialistPhoneNo ` +
                `FROM Ticket Left JOIN Solution ` +
                `ON Ticket.FinalSolutionID = Solution.ID ` +
                `WHERE Ticket.ID=${params.ticketID};`

            result = await dbQuery(sql);
            res.send(result[0]);
            break;
    }
})

module.exports = router;