const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;
const knex = require("knex");
const knexDB = knex({
  client: "pg",
  connection: "postgres://localhost/test_jwt"
});
const bookshelf = require("bookshelf");
const securePassword = require("bookshelf-secure-password");
const db = bookshelf(knexDB);
db.plugin(securePassword);

const User = db.Model.extend({
  tableName: "login_user",
  hasSecurePassword: true
});

const opts = {
  jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY
};

const strategy = new JwtStrategy(opts, (payload, next) => {
  // todo get user from db
  User.forge({ id: payload.id })
    .fetch()
    .then(res => {
      next(null, res);
    });
});

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

passport.use(strategy);
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.post("/seeduser", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).send("nofields");
  }
  const user = new User({
    email: req.body.email,
    password: req.body.password
  });
  user.save().then(() => {
    res.send("ok");
  });
});

app.post("/getToken", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(401).send("wrong credientials");
  }

  User.forge({ email: req.body.email })
    .fetch()
    .then(result => {
      if (!result) {
        res.status(400).send("user not found");
      }

      result
        .authenticate(req.body.password)
        .then(user => {
          const payload = { id: user.id };
          const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
          res.send(token);
        })
        .catch(err => {
          return res.status(401).send("error");
        });
    });
});

app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send("im protected");
  }
);

app.get(
  "/getUser",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.headers)
    res.send(req.user);
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Listening on " + PORT);
});
