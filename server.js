const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());


//functions which operates on given string input
const functions = {
  //returns the uniquecount of any element 
  uniqueCount: (...args) => {
    return new Set(args).size;
  },
  ksmallest: (k,...args) => {
    //returns the kth smallest lexicographic order
    console.log(k);
    return [parseInt(k)-args.sort() ];
    
  },
  pickRandom: (...args) => {
    //picks any random element from the array
    return args[Math.floor(Math.random() * args.length)];
  }
};

//string parser
const evaluateExpression = (expression) => {
  //pointers to move through the string input
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
    //if the function is not able to parse the given input
    if (!functions[functionName]) {
      throw new Error(`Function ${functionName} not supported`);
    }
    return functions[functionName](...args);
  };

  return parseExpression();
};

//the post method which passes our given string input
app.post('/evaluate', (req, res) => {
  try {
    const result = evaluateExpression(req.body.expression);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//defining our port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Expression evaluator API listening on port ${port}`);
});
