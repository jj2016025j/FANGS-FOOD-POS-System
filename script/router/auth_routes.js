const router = require("express").Router();
const passport = require("passport");
const pool = require("../models/user_model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

//點選登出，會清空session
router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "帳號或密碼錯誤",
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], //要什麼資料
    prompt: "select_account", //可以有選擇帳號的頁面
  })
);

router.get(
  "/line",
  passport.authenticate("line", {
    scope: ["profile"],
  })
);

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度過短，至少需要8個數字或英文字。");
    return res.redirect("/auth/signup");
  }

  //確認信箱有沒有被註冊過
  const [foundEmail] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (foundEmail) {
    req.flash("error_msg", "信箱已被註冊，請使用另一個信箱");
    return res.redirect("/auth/signup");
  }

  let hashedPassword = await bcrypt.hash(password, 12);
  await pool.query("INSERT INTO users (name,email,password) VALUES(?,?,?)", [
    name,
    email,
    hashedPassword,
  ]);
  req.flash("success_msg", "註冊會員成功，現在可以登入了");
  return res.redirect("/auth/login");
});

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  return res.redirect("/profile");
});

router.get("/line/redirect", passport.authenticate("line"), (req, res) => {
  return res.redirect("/profile");
});

module.exports = router;
