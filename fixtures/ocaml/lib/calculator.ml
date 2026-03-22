(** A simple calculator that tracks the last result. *)

type t = { mutable last_result : float }

let create () = { last_result = 0.0 }

let add calc a b =
  let result = Operations.add a b in
  calc.last_result <- result;
  result

let subtract calc a b =
  let result = Operations.subtract a b in
  calc.last_result <- result;
  result

let multiply calc a b =
  let result = Operations.multiply a b in
  calc.last_result <- result;
  result

let divide calc a b =
  let result = Operations.divide a b in
  calc.last_result <- result;
  result

let last_result calc = calc.last_result
