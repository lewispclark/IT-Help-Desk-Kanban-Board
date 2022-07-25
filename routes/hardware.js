const express = require('express');
const router = express.Router();
const dbQuery = require('./../database');
const SqlString = require('sqlstring');

router.get('/', async (req, res) => {
    // This variable will be used to store the userid when the login page has finished

    if (!req.session.userid) {
        res.redirect("login");
    }
    console.log(req.session)

    let sql =
        'SELECT PersonID as ID, Make as make, Device as device, SerialNo as serialNo FROM Hardware';

    let hardware = await dbQuery(sql);

    // Get personnel
    sql = `SELECT ID, FullName, PhoneNo, Dept, (SELECT ID IN ` +
        `(SELECT PersonnelID FROM Holidays WHERE ` +
        `(StartDate <= CURRENT_DATE AND EndDate > CURRENT_DATE))) AS OnHoliday FROM Personnel`;
    let personnel = await dbQuery(sql);

    res.render('hardware', {
        personnel: personnel,
        hardware: hardware,
        userid: req.session.userid,
        deptid: req.session.deptid
    });
});

router.post('/', async (req, res) => {
    // This variable will be used to store the userid when the login page has finished
    sql = "INSERT INTO Hardware (SerialNo, Device, Make, PersonID) " +
        `VALUES ('${req.body.SerialNo}', '${req.body.Device}', '${req.body.Make}', ${req.body.PersonID})`;

    try {
        console.log(await dbQuery(sql));
    } catch (error) {
        console.log(error);
    }

    // console.log(req)
    res.redirect('/hardware');
});

module.exports = router;