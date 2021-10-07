const isLogin = (req, res, next) => {
  if (req.session.user == null || req.session.user == undefined) {
    req.flash("message", "Session expired");
    req.flash("status", "danger");
    res.redirect("/admin/signin");
  } else {
    next();
  }
};

module.exports = isLogin;
