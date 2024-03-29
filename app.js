import express from "express";
import bodyParser from "body-parser";

import connection from "./lib/db";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/v1/addUser", (req, res) => {
  if (!req.body.deviceId) {
    return res.status(400).send({
      success: "false",
      message: "missing some required information",
    });
  }

  var user = {
    device_id: req.body.deviceId,
    registration_time: new Date(),
    ip_address:
      (req.headers["x-forwarded-for"] || "").split(",").pop() ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null),
  };

  connection.query(
    "INSERT INTO yolnisanlari_users SET ?",
    user,
    function (err, result) {
      if (err) {
        return res.status(400).send({
          success: "false",
          message: "some error from database",
        });
      } else {
        return res.status(201).send({
          success: "true",
          message: "User added successfully",
        });
      }
    }
  );
});

app.post("/api/v1/addContestInfo", (req, res) => {
  const { deviceId, testPoint, watchedVideo, seenInterstitial } = req.body;

  var isValid = false;

  if (deviceId && watchedVideo && testPoint && seenInterstitial) {
    console.log("valid");
    isValid = true;
  }

  if (!isValid) {
    return res.status(400).send({
      success: "false",
      message: "missing some required information",
    });
  }

  var contestInfo = {
    device_id: deviceId,
    test_date: new Date(),
    test_point: testPoint * (watchedVideo == "0" ? 1 : 5),
    watched_video: parseInt(watchedVideo),
    seen_interstitial: seenInterstitial,
    ip_address:
      (req.headers["x-forwarded-for"] || "").split(",").pop() ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null),
  };

  connection.query(
    "INSERT INTO yolnisanlari_contest_info SET ?",
    contestInfo,
    function (err, result) {
      if (err) {
        return res.status(400).send({
          success: "false",
          message: "some error from database",
        });
      } else {
        return res.status(201).send({
          success: "true",
          message: "Contest info added successfully",
        });
      }
    }
  );
});

app.get("/api/v1/getServerTime", (req, res) => {
  res.status(200).send({
    success: "true",
    message: new Date(),
  });
});

// get daily winner
app.post("/api/v1/getDailyWinner", (req, res) => {
  const { deviceId, operator } = req.body;

  var isValid = false;

  if (deviceId) {
    isValid = true;
  }

  if (!isValid) {
    return res.status(400).send({
      success: "false",
      message: "missing some required information",
    });
  }

  connection.query(
    "SELECT device_id, CAST(win_date AS CHAR) win_date, code_id, id FROM yolnisanlari_winners WHERE subdate(current_date, 1) = win_date AND daily = 1",
    function (err, result) {
      if (err) {
        return res.status(400).send({
          success: "false",
          message: "some error from database",
        });
      } else {
        // check if the result's device_id is the user's device id
        if (result[0].device_id == deviceId) {
          // if code_id is 0, no code has been assigned. get a code and assign
          if (result[0].code_id == 0) {
            // is winner. if operator is given, select unused code for the operator
            if (
              operator == "azercell" ||
              operator == "bakcell" ||
              operator == "nar"
            ) {
              // get an unused code from table
              connection.query(
                "SELECT * FROM yolnisanlari_codes WHERE is_used = 0 AND operator = ? AND id NOT IN (SELECT code_id from yolnisanlari_winners WHERE code_id <> 0) LIMIT 1",
                operator,
                function (err, codeResults) {
                  if (err) throw err;

                  // add the code to winner object
                  var winner = {
                    device_id: result[0].device_id,
                    win_date: result[0].win_date,
                    code: codeResults[0].code,
                  };
                  // update the table
                  var updateInfo = [codeResults[0].id, result[0].id];
                  connection.query(
                    "UPDATE yolnisanlari_winners SET code_id = ? WHERE id = ?",
                    updateInfo,
                    function (err, updateResult) {
                      if (err) throw err;
                    }
                  );

                  return res.status(201).send({
                    success: "true",
                    message:
                      "Təbriklər! Bugünkü qalib sənsən! \n\r \n\r Dostlarınla paylaş, dostların da həm öyrənib, həm balans əldə etsinlər!",
                    winner,
                  });
                }
              );
            }
          } else {
            // code_is is already assigned. get the code from the table
            connection.query(
              "SELECT * FROM yolnisanlari_codes WHERE id = ?",
              result[0].code_id,
              function (err, codeResults) {
                if (err) throw err;

                // add the code to winner object
                var winner = {
                  device_id: result[0].device_id,
                  win_date: result[0].win_date,
                  code: codeResults[0].code,
                };

                return res.status(201).send({
                  success: "true",
                  message:
                    "Təbriklər! Bugünkü qalib sənsən! \n\r \n\r Dostlarınla paylaş, dostların da həm öyrənib, həm balans əldə etsinlər!",
                  winner,
                });
              }
            );
          }
        } else {
          var winner = {
            win_date: result[0].win_date,
          };
          // is not the winner
          res.status(400).send({
            success: "false",
            message:
              "Qalib olmadın, amma kədərlənmə, hər gün test edərək, videoya baxaraq hər gün kontur əldə edə bilərsən! \n\r \n\r Dostlarınla paylaş, dostların da həm öyrənib, həm balans əldə etsinlər!",
            winner,
          });
        }
      }
    }
  );
});

app.post("/api/v1/getIfOldWinner/", (req, res) => {
  const { deviceId } = req.body;

  var isValid = false;

  if (deviceId) {
    isValid = true;
  }

  if (!isValid) {
    return res.status(400).send({
      success: "false",
      message: "missing some required information",
    });
  }

  connection.query(
    "select CAST(yw.win_date AS CHAR) win_date, yc.code, yc.operator from yolnisanlari_winners yw, yolnisanlari_codes yc where yw.code_id = yc.id and yw.device_id = ? and yw.code_id <> 0",
    deviceId,
    function (err, result) {
      if (err) {
        return res.status(400).send({
          success: "false",
          message: "some error from database",
        });
      } else {
        if (result.length > 0) {
          var winner = {
            result,
          };

          return res.status(201).send({
            success: "true",
            message: "",
            winner,
          });
        } else {
          return res.status(400).send({
            success: "false",
            message: "no result",
          });
        }
      }
    }
  );
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
