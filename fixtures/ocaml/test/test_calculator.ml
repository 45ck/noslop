let epsilon = 1e-9

let assert_close label expected actual =
  if Float.abs (expected -. actual) >= epsilon then
    failwith
      (Printf.sprintf "%s: expected %f got %f" label expected actual)

let test_new_calculator () =
  let calc = Calculator.create () in
  assert_close "new calculator last_result" 0.0
    (Calculator.last_result calc)

let test_add () =
  let calc = Calculator.create () in
  let result = Calculator.add calc 2.0 3.0 in
  assert_close "add 2 3" 5.0 result

let test_subtract () =
  let calc = Calculator.create () in
  let result = Calculator.subtract calc 5.0 3.0 in
  assert_close "subtract 5 3" 2.0 result

let test_multiply () =
  let calc = Calculator.create () in
  let result = Calculator.multiply calc 4.0 3.0 in
  assert_close "multiply 4 3" 12.0 result

let test_divide () =
  let calc = Calculator.create () in
  let result = Calculator.divide calc 10.0 2.0 in
  assert_close "divide 10 2" 5.0 result

let test_divide_by_zero () =
  let calc = Calculator.create () in
  try
    let _ = Calculator.divide calc 10.0 0.0 in
    failwith "divide 10 0 should raise"
  with Errors.Division_by_zero -> ()

let test_last_result () =
  let calc = Calculator.create () in
  let _ = Calculator.add calc 1.0 2.0 in
  assert_close "last_result after add" 3.0
    (Calculator.last_result calc);
  let _ = Calculator.multiply calc 3.0 4.0 in
  assert_close "last_result after multiply" 12.0
    (Calculator.last_result calc)

let test_operations_add () =
  assert_close "Operations.add 2 3" 5.0 (Operations.add 2.0 3.0)

let test_operations_subtract () =
  assert_close "Operations.subtract 5 3" 2.0
    (Operations.subtract 5.0 3.0)

let test_operations_multiply () =
  assert_close "Operations.multiply 4 3" 12.0
    (Operations.multiply 4.0 3.0)

let test_operations_divide () =
  assert_close "Operations.divide 10 2" 5.0
    (Operations.divide 10.0 2.0)

let test_operations_divide_by_zero () =
  try
    let _ = Operations.divide 10.0 0.0 in
    failwith "Operations.divide 10 0 should raise"
  with Errors.Division_by_zero -> ()

let () =
  test_new_calculator ();
  test_add ();
  test_subtract ();
  test_multiply ();
  test_divide ();
  test_divide_by_zero ();
  test_last_result ();
  test_operations_add ();
  test_operations_subtract ();
  test_operations_multiply ();
  test_operations_divide ();
  test_operations_divide_by_zero ();
  print_endline "All tests passed."
