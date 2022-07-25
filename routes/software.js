const express = require('express');
const router = express.Router();
const dbQuery = require('./../database');
const SqlString = require('sqlstring');


router.get('/', async (req, res) => {
    if (!req.session.userid) {
        res.redirect("login");
    } else if (req.session.deptid != 6) {
        res.redirect("ticket-list");
    }

    let sql = `SELECT ID, SoftwareName, Software.SoftwareVersion, Software.LicenseNumber, Software.PersonID FROM Software;`;

    let softwares = await dbQuery(sql);

    // Get personnel
    sql = `SELECT ID, FullName, PhoneNo, Dept, (SELECT ID IN ` +
        `(SELECT PersonnelID FROM Holidays WHERE ` +
        `(StartDate <= CURRENT_DATE AND EndDate > CURRENT_DATE))) AS OnHoliday FROM Personnel`;
    let personnel = await dbQuery(sql);

    res.render('software', { personnel: personnel, software: softwares, userid: req.session.userid, deptid: req.session.deptid });
});

router.post('/', async (req, res) => {
    // This variable will be used to store the userid when the login page has finished
    sql = "INSERT INTO Software (Softwarename, SoftwareVersion, LicenseNumber, PersonID)" +
        `VALUES ('${req.body.Softwarename}', '${req.body.SoftwarVersion}', '${req.body.LicenseNumber}', ${req.body.PersonID})`;

    try {
        console.log(await dbQuery(sql));
    } catch (error) {
        console.log(error);
    }

    console.log(req)
    res.redirect('/software');
});


module.exports = router;