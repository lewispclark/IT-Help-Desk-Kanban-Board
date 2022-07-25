var express = require('express');
var router = express.Router();
const dbQuery = require('./../database');

const bcrypt = require('bcrypt');

async function hashIt(password) {
  const salt = await bcrypt.genSalt(6);
  const hashed = await bcrypt.hash(password, salt);

  return hashed;
}
// hashIt(password);
// compare the password user entered with hashed pass.
async function compareIt(password, hashedPassword) {
  const validPassword = await bcrypt.compare(password, hashedPassword);

  return validPassword;
}
// compareIt(password);

/* GET login page. */
router.get('/', function (req, res, next) {
  res.render('login', { error: false });
});

router.post('/', async (req, res) => {
  // This variable will be used to store the userid when the login page has finished

  switch (req.body.form_type) {

    case "login":
      req.session.userid = 0;
      req.session.deptid = 0;
      req.session.username = "";

      // If user is adding a new problem type
      console.log(req.body.username);

      let returnObj = {}

      sql = `SELECT ID, Username, PasswordHash, Dept, (SELECT DeptName FROM Departments WHERE ID = Dept) AS DeptName, ` +
        `CASE ` +
        `WHEN Dept = 6 AND(SELECT External FROM SpecialistActiveExternal WHERE SpecialistID = ID) = 1 AND(SELECT COUNT(ID) FROM Ticket WHERE AssignedSpecialistID = Personnel.ID AND TicketState != 'RESOLVED') < 1 THEN 0 ` +
        `ELSE 1 ` +
        `END AS AllowedAccess ` +
        `FROM Personnel ` +
        `WHERE Username = '${req.body.username}'`;

      let user = (await dbQuery(sql))[0];
      if (!user) { 
        res.render("login", { error: true }) 
        return;
      };
      if (await compareIt(req.body.password, user.PasswordHash) && user.AllowedAccess) {
        req.session.userid = user.ID;
        req.session.deptid = user.Dept;
        req.session.username = user.Username;

        req.session.save(function (err) {
          // session saved
        })

        res.redirect("ticket-list");
      } else {
        res.render("login", { error: true });
      }
      break;
  }
});

module.exports = router;
