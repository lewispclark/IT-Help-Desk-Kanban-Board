const express = require('express');
const router = express.Router();
const dbQuery = require('./../database');
const SqlString = require('sqlstring');

router.post('/', async (req, res) => {
    console.log(req.body);

    let sql = `INSERT INTO Faq (Category, ProblemTypeID, Question, Answer) VALUES ('${req.body.Category}', '${req.body.ProblemType}', '${req.body.Question}', '${req.body.Answer}');`

    console.log(await dbQuery(sql));

    res.redirect('/faq');
});

router.get('/', async (req, res) => {
    if (!req.session.userid) {
        res.redirect("login");
    }

    let hardwareSQL = `SELECT *, (SELECT Problem FROM ProblemType WHERE ID = ProblemTypeID) AS ProblemType FROM Faq WHERE Category = 'Hardware'`;
    let softwareSQL = `SELECT *, (SELECT Problem FROM ProblemType WHERE ID = ProblemTypeID) AS ProblemType FROM Faq WHERE Category = 'Software'`;

    let hardwareFAQ = await dbQuery(hardwareSQL);
    let softwareFAQ = await dbQuery(softwareSQL);
    let hardwareProblemTypes = await dbQuery("SELECT * FROM ProblemType WHERE ID IN (SELECT ProblemTypeID FROM Faq WHERE Category = 'Hardware' GROUP BY ProblemTypeID)");
    let softwareProblemTypes = await dbQuery("SELECT * FROM ProblemType WHERE ID IN (SELECT ProblemTypeID FROM Faq WHERE Category = 'Software' GROUP BY ProblemTypeID)");

    // console.log(hardwareFAQ);
    // console.log(softwareFAQ);

    let problemTypes = await dbQuery("SELECT * FROM ProblemType");

    res.render('faq', {
        problemTypes: problemTypes,
        hardwareProblemTypes: hardwareProblemTypes,
        softwareProblemTypes: softwareProblemTypes,
        hardwareFAQ: hardwareFAQ,
        softwareFAQ: softwareFAQ,
        userid: req.session.userid,
        deptid: req.session.deptid
    });
});

module.exports = router;