const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const functions = {
  uniqueCount: (...args) => {
    return new Set(args).size;
  },
  ksmallest: (k, ...args) => {
    args.sort();
    return args.sort()[parseInt(k) - 1];
  },
  pickRandom: (...args) => {
    return args[Math.floor(Math.random() * args.length)];
  }
};


const evaluateExpression = (expression) => {
  let currentIndex = 0;
  const nextChar = () => expression[currentIndex++];
  const peekChar = () => expression[currentIndex];

  const parseStringLiteral = () => {
    let string = '';
    while (peekChar() !== "'") {
      string += nextChar();
    }
    nextChar();
    return string;
  };

  const parseExpression = () => {
    let char = peekChar();
    if (char === "'") {
      nextChar();
      return parseStringLiteral();
    }
    let functionName = '';
    while (char !== '(') {
      functionName += nextChar();
      char = peekChar();
    }
    nextChar();
    let args = [];
    char = peekChar();
    while (char !== ')') {
      args.push(parseExpression());
      char = peekChar();
      if (char === ',') {
        nextChar();
      }
    }
    nextChar();
    if (!functions[functionName]) {
      throw new Error(`Function ${functionName} not supported`);
    }
    return functions[functionName](...args);
  };

  return parseExpression();
};

app.post('/evaluate', (req, res) => {
  try {
    const result = evaluateExpression(req.body.expression);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Expression evaluator API listening on port ${port}`);
});
