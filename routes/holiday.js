const express = require('express');
const router = express.Router();
const dbQuery = require('./../database');
const SqlString = require('sqlstring');

router.post('/', async (req, res) => {
    console.log(req.body);

    let sql = `INSERT INTO Holidays (StartDate, EndDate, PersonnelID) VALUES ('${req.body.startDate}', '${req.body.endDate}', '${req.session.userid}');`

    console.log(await dbQuery(sql));

    res.redirect('/holiday');
});

router.get('/', async (req, res) => {
    if (!req.session.userid) {
        res.redirect("login");
    } else if (req.session.deptid != 6) {
        res.redirect("ticket-list");
    }


    res.render('holiday', {
        userid: req.session.userid,
        deptid: req.session.deptid
    });
});

module.exports = router;