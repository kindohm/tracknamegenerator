const express = require("express");
const { query, validationResult } = require("express-validator");
const app = express();
const port = 3000;

express.json();

app.use('/', express.static('public'))

function getRandomIntInclusive(min, max) {
  const min2 = Math.ceil(min);
  const max2 = Math.floor(max);
  return Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
}

const getTrack = (input, minLength, maxLength, jumpProb) => {
  const firstPos = getRandomIntInclusive(0, input.length - 1);
  const length = getRandomIntInclusive(minLength, maxLength) - 1;
  const positions = Array.apply(null, Array(length)).reduce(
    (acc) => {
      const lastPos = acc[acc.length - 1];
      const rand = Math.random();
      if (rand > jumpProb) {
        return acc.concat([lastPos + 1 < input.length ? lastPos + 1 : 0]);
      }
      return acc.concat([getRandomIntInclusive(0, input.length - 1)]);
    },
    [firstPos]
  );

  return positions
    .map((pos) => {
      return input[pos];
    })
    .join("");
};

app.get(
  "/api",
  [
    query('input').exists(),
    query("count").optional().isInt({min: 1, max: 100}),
    query('spaces').optional().isBoolean(),
    query('minLength').optional().isInt({min: 1, max: 100}),
    query('maxLength').optional().isInt({min: 1, max: 100}),
    query("jumpProb").optional().isFloat({ min: 0, max: 1 }),
  ],
  (req, res) => {    
    console.log("request", req.query);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('input was not valid');
      console.error(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const { query } = req;
    const { input, count, spaces, minLength, maxLength, jumpProb } = query;
    const realCount = count ? Number.parseInt(count) : 10;
    const keepSpaces = spaces === "true";
    const inputNoSpaces = keepSpaces ? input : input.split(" ").join("");
    const realMinLength = minLength ? Number.parseInt(minLength) : 3;
    const realMaxLength = maxLength ? Number.parseInt(maxLength) : 10;
    const jump = jumpProb ? Number.parseFloat(jumpProb) : 0.25;

    if (!input) {
      return res.status(400).send("Bad Request");
    }

    const tracks = Array.apply(null, Array(realCount)).map(() => {
      return getTrack(inputNoSpaces, realMinLength, realMaxLength, jump);
    });

    res.json(tracks);
  }
);

app.listen(port, () => console.log(`Listening on port '${port}'`));
