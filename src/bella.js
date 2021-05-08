function interpret(program) {
  return P(program)
}

const P = (program) => {
  let statements = program.body
  let w = [{}, []]
  //console.log("bella: Program execution is about to begin!")
  for (let s of statements) {
    w = S(s)(w)
  }
  console.log("bella: Program is executed!")
  console.log("global memory scope:", w[0])
  return w[1]
}

const S = (statement) => ([memory, output]) => {
  console.log("Statement Detected!")
  if (statement.constructor === VariableDeclaration) {
    let { variable, initializer } = statement
    return [{ ...memory, [variable]: E(initializer)(memory) }, output]
  } else if (statement.constructor === PrintStatement) {
    let { argument } = statement  
    //console.log("The statement is PRINT")
    output.push(E(argument)(memory))
    return [memory, output]
  } else if (statement.constructor === Assignment) {
    console.log("Aissignment is called!")
    let { target, source } = statement
    return [{ ...memory, [target]: E(source)(memory)}, output]
  } else if (statement.constructor === WhileStatement) {
    console.log("WhileLoop detected!")
    let test = statement.test
    let body = statement.body
    let w = [memory, output]
    if(C(test)(memory)){
      //console.log(`Body ${body}`)
      //console.log(`body[0] ${body[0]}`)
      //console.log(`body[1] ${body[1]}`)
      //console.log(typeof(body))
      for (let i=0; i<body.length; i++){
        console.log("In side the while loop")
        //console.log("s is",body[i])
        //s.toString()
        w = S(body[i])([memory, output])
        console.log(w) 
      }
      return S(whileLoop(test, body))(w)
    }else{
      return w
    }  
  } else if (statement.constructor === FunctionDeclaration) {
      let {name, parameters, body} = statement
      return [{ ...memory, [name]: statement}, output]
  } else if(statement.constructor === FunctionCall){
      let f = E(statement.function_)(memory) // retrive function declaration objet
      statement.memory = {...memory} //create new local memory space with gloab access
      for (let i=0;i<f.parameters.length;i++){ //parameters' definition
        statement.memory[f.parameters[i]] = E(statement.parameters[i])(statement.memory)
      }
      let w = [statement.memory, output]
      for (let i=0; i<f.body.length;i++){
        w = S(f.body[i])(w)
      }
      console.log("Output after executing function:",output)
      console.log("local memory scope:",statement.memory)
      return [memory, output] //local memory (statement.memory) is excluded due to the principle of 'scope'
  }
}

const E = (expression) => (memory) => {
  if (typeof expression === "number" || typeof expression === "boolean") {
    return expression
  } else if (typeof expression == "string") {
    const i = expression
    return memory[i]
  } else if (expression.constructor === Unary) {
    if (expression.op === '-'){
      return -E(expression)(memory)
    } else{
      console.log("not expression")
      return C(expression)(memory)
    }
    
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
  } else if (expression.constructor === Ternary){
    console.log("Bella: The expressin is Ternary!")
    let {condition, value1, value2} = expression
    if (C(condition)(memory)){
      return E(value1)(memory)
    } else{
      return E(value2)(memory)
    }
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
    /*console.log(`operand: ${operand}`)
    let ans = !C(operand)(memory)
    console.log(`ans: ${ans}`)*/
    return !C(E(operand)(memory))(memory)
  }
  // FOR YOU: HANDLE CALLS

  // FOR YOU: HANDLE CONDITIONAL EXPRESSION (?:)
}

class Program {
  constructor(body) {
    this.body = body
    console.log("bella: Program body is created!")
  }
}

class VariableDeclaration {
  constructor(variable, initializer) {
    console.log("bella: Variable is declared!")
    Object.assign(this, { variable, initializer })
  }
}

class FunctionDeclaration {
  constructor(name, parameters, body) {
    Object.assign(this, { name, parameters, body })
  }
}

class FunctionCall {
  constructor(function_, parameters){
    Object.assign(this, { function_, parameters })
    this.memory = {}
  }
}

class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

class WhileStatement {
  constructor(test, body) {
    console.log("While Loop is created!")
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
const ifelse = (c, a, b) => new Ternary(c, a, b) //this creates a ternary operator
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
const fun = (n, p, b) => new FunctionDeclaration(n, p, b)
const call = (f,p) => new FunctionCall(f,p)
const negative = (x) => new Unary('-', x)
const not = (x) => new Unary('!', x)

//console.log(interpret(program([vardec("x", 2), print("x")])))

/*console.log(
  interpret(
    program([
      vardec("x", 3),
      whileLoop(less("x", 10), [print("x"), assign("x", plus("x", 2))])
   ])
   )
 )


console.log(
  P(
    program([
      vardec("x", 3),
      vardec("y", plus("x", 10)),
      print("x"),
      print("y"),
    ])
  )
)

console.log(
  P(
    program([
      vardec("x", 17),
      vardec("y", plus("x", 20)),
      assign("x", plus("x", "y")),
      print("x"),
      print("y"),
    ])
  )
)

console.log(
  interpret(
    program([
      vardec("x", 23),
      vardec("y", 34),
      fun("MyFunction", ["x", "y"], [print("function is created!")])
    ])
  )
)*/

console.log(
  interpret(
    program([
      vardec("x", 64),
      vardec("y", 76),
      assign("z", ifelse(less("x","y"), power("x",2), plus("x","y"))),
      print("z"),
      vardec("t", true),
      assign("f", not("t")),
      print("f"),
      print("t"),
      print(not("t")),
      fun("addition", ["a","b"], [assign("c", plus("a","b")), print("c")]),
      call("addition", ["x", "y"])
    ])
  )
)
