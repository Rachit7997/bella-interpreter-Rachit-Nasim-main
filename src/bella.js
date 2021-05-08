function interpret(program) {
  return P(program)
}

const P = (program) => {
  let statements = program.body
  let w = [{}, []]
  for (let s of statements) {
      w = S(s)(w)
  }
  return w[1]
}

const S = (statement) => ([memory, output]) => {
  if (statement.constructor === VariableDeclaration) {
      let { variable, initializer } = statement
      return [{ ...memory, [variable]: E(initializer)(memory) }, output]
  } else if (statement.constructor === PrintStatement) {
      let { argument } = statement  
      output.push(E(argument)(memory))
      return [memory, output]
  } else if (statement.constructor === Assignment) {
      let { target, source } = statement
      return [{ ...memory, [target]: E(source)([memory, output])}, output]
  } 
  else if (statement.constructor === WhileStatement) {
      let test = statement.test
      let body = statement.body
      let w = [memory, output]
      if(C(test)(memory)) {
          for (let i=0; i<body.length; i++){
          w = S(body[i])([memory, output])
          console.log(w) 
      }
      return S(whileLoop(test, body))(w)
      } else {
          return w
      }  
  } else if (statement.constructor === FunctionDeclaration) {
      // //
      // const { name, parameters, body } = statement
      // return [{ ...memory, [name]: { parameters, body } }, output]
      // //

      let { name, parameters, body } = statement
      return [{ ...memory, [name]: { parameters, body } }, output]
  }
}

const E = (expression) => (memory) => {
  if (typeof expression === "number" || typeof expression === "boolean") {
      return expression
  } else if (typeof expression == "string") {
      const i = expression
      return memory[i]
  } else if (expression.constructor === Unary) {
      return -E(expression)(memory)
  } else if (expression.constructor === Binary) {
      const { op, left, right } = expression
      switch (op) {
          case "+":
              return E(left)(memory) + E(right)(memory)
          case "-":
              return E(left)(memory) - E(right)(memory)
          case "*":
              return E(left)(memory) * E(right)(memory)
          case "/":
              return E(left)(memory) / E(right)(memory)
          case "%":
              return E(left)(memory) % E(right)(memory)
          case "**":
              return E(left)(memory) ** E(right)(memory)
          default:
              return E(C(expression)(memory))(memory)
      }
  } else if (expression.constructor === Ternary) {
      const { condition, value1, value2 } = expression
      return C(condition)(memory) ? E(value1)(memory) : E(value2)(memory)
  }
}

const C = (condition) => (memory) => {
  if (condition === true) {
      return true
  } else if (condition === false) {
      return false
  } else if (condition.constructor === Binary) {
      const { op, left, right } = condition
      switch (op) {
          case "==":
              return E(left)(memory) === E(right)(memory)
          case "!=":
              return E(left)(memory) !== E(right)(memory)
          case "<":
              return E(left)(memory) < E(right)(memory)
          case "<=":
              return E(left)(memory) <= E(right)(memory)
          case ">":
              return E(left)(memory) >= E(right)(memory)
          case ">=":
              return E(left)(memory) >= E(right)(memory)
          case "&&":
              return C(left)(memory) && C(right)(memory)
          case "||":
              return C(left)(memory) || C(right)(memory)
      }
  } else if (condition.constructor === Unary) {
      const { op, operand } = condition
      return !C(operand)(memory)
  }
}

class Program {
  constructor(body) {
      this.body = body
  }
}

class VariableDeclaration {
  constructor(variable, initializer) {
      Object.assign(this, { variable, initializer })
  }
}

class FunctionDeclaration {
  constructor(name, parameters, body) {
      Object.assign(this, { name, parameters, body })
  }
}

class PrintStatement {
  constructor(argument) {
      this.argument = argument
  }
}

class WhileStatement {
  constructor(test, body) {
      Object.assign(this, { test, body })
  }
}

class Assignment {
  constructor(target, source) {
      Object.assign(this, { target, source })
  }
}

class Binary {
  constructor(op, left, right) {
      Object.assign(this, { op, left, right })
  }
}

class Unary {
  constructor(op, operand) {
      Object.assign(this, { op, operand })
  }
}

class Ternary {
  constructor(condition, value1, value2){
      Object.assign(this, {condition, value1, value2})
  }
}

const program = (s) => new Program(s)
const vardec = (i, e) => new VariableDeclaration(i, e)
const print = (e) => new PrintStatement(e)
const whileLoop = (c, b) => new WhileStatement(c, b)
const ternary = (c, a, b) => new Ternary(c, a, b)
const plus = (x, y) => new Binary("+", x, y)
const minus = (x, y) => new Binary("-", x, y)
const times = (x, y) => new Binary("*", x, y)
const remainder = (x, y) => new Binary("%", x, y)
const power = (x, y) => new Binary("**", x, y)
const eq = (x, y) => new Binary("==", x, y)
const noteq = (x, y) => new Binary("!=", x, y)
const less = (x, y) => new Binary("<", x, y)
const lesseq = (x, y) => new Binary("<=", x, y)
const greater = (x, y) => new Binary(">", x, y)
const greatereq = (x, y) => new Binary(">=", x, y)
const and = (x, y) => new Binary("&&", x, y)
const or = (x, y) => new Binary("||", x, y)
const assign = (x,y) => new Assignment(x,y)
const func = (n, p, b) => new FunctionDeclaration(n, p, b)


// Tests
// Expected Value [10, false, 4583720, -4583630, 206265375, 20, 2.9974064041865856e-8, false,
//                 true, false, false, true, true, true]
console.log (
  interpret (
      program ([
          vardec("x", 10),
          print("x"),
          whileLoop(greatereq("x", assign("x", plus("x", 5)))),
          print(ternary(eq("x", minus("x", 5)), true, false)),
          vardec("y", 4583675),
          vardec("z", 45),
          print(plus("y", "z")),
          print(minus("z", "y")),
          print(times("y", "z")),
          print(remainder("y", "z")),
          print(power(76, -4)),
          print(eq("y", "z")),
          print(noteq("y", "z")),
          print(less("y", "z")),
          print(lesseq("y", "z")),
          print(greater("y", "z")),
          print(greatereq("y", "z")),
          assign("z", 10),
          print(eq("z", 10))
      ])
  )
)