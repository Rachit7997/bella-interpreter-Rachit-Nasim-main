# Bella Semantics and Interpreter

Group Members: Rachit Patel, Sk Nasimul Alahi

Bella is a simple programming language designed in a Programming Language Semantics class.

## Example

```
let x = 3;
while x < 10 {
  print x;
  x = x + 2;
}
```

This program outputs 3 5 7 9

## Abstract Syntax

```
p: Prog
c: Cond
e: Exp
s: Stmt
i: Ide
n: Numeral

Prog ::= s*
Exp  ::= n | i | e + e | e - e | e * e | e / e
      |  e ** e | - e | i e* | c ? e1 : e2
Cond ::= true | false | ~ c | c && c | c || c
      |  e == e | e != e | e < e | e <= e
      |  e > e | e >= e
Stmt ::= let i e | i = e | while c s* | print e
      |  fun i i* e
```

## Denotational Semantics

```
type File = Num*
type Memory = Ide -> Num  (in JS, a Map; in Python a dict)
type State = Memory x File

𝒫: Prog -> File
ℰ: Exp -> Memory -> Num
𝒮: Stmt -> State -> State
𝒞: Cond -> Memory -> Bool

𝒫 ⟦s*⟧ = S*⟦s*⟧({}, [])

𝒮 ⟦let i e⟧ (m,o) = (m [ℰ ⟦e⟧ m / i], o)
𝒮 ⟦fun i i* e⟧ (m,o) = (m [(i*, e) / i], o)
𝒮 ⟦i = e⟧ (m,o) = (m [ℰ ⟦e⟧ m / i], o)
𝒮 ⟦print e⟧ (m,o) = (m, o + ℰ ⟦e⟧ m)
𝒮 ⟦while c do s*⟧ (m,o) = if 𝒞 ⟦c⟧ m = F then (m,o) else (𝒮 ⟦while c do s*⟧) (𝒮* ⟦s*⟧ (m,o))

ℰ ⟦n⟧ m = n
ℰ ⟦i⟧ m = m i
ℰ ⟦e1 + e2⟧ m = ℰ ⟦e1⟧ m + ℰ ⟦e2⟧ m
ℰ ⟦e1 - e2⟧ m = ℰ ⟦e1⟧ m - ℰ ⟦e2⟧ m
ℰ ⟦e1 * e2⟧ m = ℰ ⟦e1⟧ m * ℰ ⟦e2⟧ m
ℰ ⟦e1 / e2⟧ m = ℰ ⟦e1⟧ m / ℰ ⟦e2⟧ m
ℰ ⟦e1 % e2⟧ m = ℰ ⟦e1⟧ m % ℰ ⟦e2⟧ m
ℰ ⟦e1 ** e2⟧ m = ℰ ⟦e1⟧ m ** ℰ ⟦e2⟧ m
ℰ ⟦- e⟧ m = - ℰ ⟦e⟧ m
ℰ ⟦i e*⟧ m = let (i*, e) = m (i) in ℰ ⟦e⟧ m [a_i / i*_i]_i
ℰ ⟦c ? e1 : e2⟧ m = if 𝒞 ⟦c⟧ m = T then ℰ ⟦e1⟧ m else ℰ ⟦e2⟧ m

𝒞 ⟦true⟧ m = T
𝒞 ⟦false⟧ m = F
𝒞 ⟦e1 == e2⟧ m = ℰ ⟦e1⟧ m = ℰ ⟦e2⟧ m
𝒞 ⟦e1 != e2⟧ m = not (ℰ ⟦e1⟧ m = ℰ ⟦e2⟧ m)
𝒞 ⟦e1 < e2⟧ m = ℰ ⟦e1⟧ m < ℰ ⟦e2⟧ m
𝒞 ⟦e1 <= e2⟧ m = ℰ ⟦e1⟧ m <= ℰ ⟦e2⟧ m
𝒞 ⟦e1 > e2⟧ m = ℰ ⟦e1⟧ m > ℰ ⟦e2⟧ m
𝒞 ⟦e1 >= e2⟧ m = ℰ ⟦e1⟧ m >= ℰ ⟦e2⟧ m
𝒞 ⟦~c⟧ m = not (𝒞 ⟦c⟧ m)
𝒞 ⟦c1 && c2⟧ m = if 𝒞 ⟦c1⟧ m then 𝒞 ⟦c2⟧ m else F
𝒞 ⟦c1 || c2⟧ m = if 𝒞 ⟦c1⟧ m then T else 𝒞 ⟦c2⟧ m
```

## Using the Interpreter

```
Tests
Expected Output: [ 4096, false, true, false, 140 ]

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
```
