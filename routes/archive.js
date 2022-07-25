const express = require('express');
const router = express.Router();
const dbQuery = require('./../database');
const SqlString = require('sqlstring');

router.get('/', async (req, res) => {
    // This variable will be used to store the userid when the login page has finished

    if (!req.session.userid) {
        res.redirect("login");
    } else if (req.session.deptid != 6) {
        res.redirect("ticket-list");
    }

    let sql = `SELECT
    Ticket.ID,
    Ticket.TicketDescription AS "ProblemDescription", 
    FinalSolutionID AS "SolutionID",
    (SELECT Explanation From Solution Where Solution.ID = Ticket.FinalSolutionID) AS "Solution",
    ProblemType.Problem,
    CreatedTimestamp AS "CreatedDate", 
    ResolvedTimestamp AS "ResolvedDate" 
    FROM Ticket LEFT JOIN ProblemType 
    ON Ticket.TypeID = ProblemType.ID 
    WHERE FinalSolutionID != "NULL" AND Ticket.TicketState="RESOLVED"`;

    let problemTypes = await dbQuery('SELECT * FROM ProblemType');
    let tickets = await dbQuery(sql);
    console.log(problemTypes)
    console.log(tickets);

    res.render('archive', {
        tickets: tickets, 
        userid: req.session.userid,
        deptid: req.session.deptid,
    });
});

module.exports = router;