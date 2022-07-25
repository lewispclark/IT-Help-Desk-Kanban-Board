var express = require('express');
var router = express.Router();

/* log out */
router.get('/logout', function(req, res){
  req.session.userid = 0;
  req.session.deptid = 0;
  req.session.username = "";

  res.redirect('/login');
});

router.get('/*', function(req, res) {
  res.redirect('/login');
});

module.exports = router;
